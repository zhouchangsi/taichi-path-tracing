import * as ti from "taichi.js/dist/taichi";
import { get_camera_ray, setupCamera } from "./camera";
import { hit_objects, setupScene } from "./scene";

let cancelID

export const pathTracing = async (options) => {
    cancelAnimationFrame(cancelID)
    console.log(options);
    await ti.init();
    setupCamera();
    setupScene(options.brightness);

    const aspect_ratio = 1
    const image_width = options.size;
    const image_height = Math.floor(image_width / aspect_ratio);
    const pixels = ti.Vector.field(3, ti.f32, [image_width, image_height]);
    const samples_per_pixel = 4;
    const sample_on_unit_sphere_surface = true;
    const max_depth = 10;
    ti.addToKernelScope({
        image_height,
        image_width,
        pixels,
        samples_per_pixel,
        sample_on_unit_sphere_surface,
        max_depth,
    });

    let ran3 = ti.func(() => {
        return [ti.random(), ti.random(), ti.random()];
    });

    let random_in_unit_sphere = ti.func(() => {
        let p = 2 * ran3() - [1, 1, 1];
        while (p.norm() >= 1.0) {
            p = 2 * ran3() - [1, 1, 1];
        }
        return p;
    });

    let random_unit_vector = ti.func(() => {
        return random_in_unit_sphere().normalized()
    })

    let reflect = ti.func((v, normal) => {
        return v - 2 * v.dot(normal) * normal;
    });

    let refract = ti.func((uv, n, etai_over_etat) => {
        let cos_theta = min(n.dot(-uv), 1.0);
        let r_out_perp = etai_over_etat * (uv + cos_theta * n);
        let r_out_parallel = -sqrt(abs(1.0 - r_out_perp.dot(r_out_perp))) * n;
        return r_out_perp + r_out_parallel;
    });

    let reflectance = ti.func((cosine, ref_idx) => {
        let r0 = (1 - ref_idx) / (1 + ref_idx);
        r0 = r0 * r0;
        return r0 + (1 - r0) * pow(1 - cosine, 5);
    });

    let ray_color = ti.func((ray) => {
        let color_buffer = [0.0, 0.0, 0.0];
        let brightness = [1.0, 1.0, 1.0];
        let scattered_origin = ray.origin;
        let scattered_direction = ray.direction;
        let p_RR = 0.8;

        let n = 0;
        while (n < max_depth) {
            if (ti.random() > p_RR) {
                break;
            }

            const result = hit_objects(
                { origin: scattered_origin, direction: scattered_direction },
                0.001,
                10e8
            );

            if (result.is_hit) {
                if (result.material === 0) {
                    color_buffer = result.color * brightness;
                    break;
                } else {
                    if (result.material === 1) {
                        let target = result.hit_point + result.hit_point_normal;
                        if (sample_on_unit_sphere_surface) {
                            target += random_unit_vector();
                        } else {
                            target += random_in_unit_sphere();
                        }
                        scattered_direction = target - result.hit_point;
                        scattered_origin = result.hit_point;
                        brightness *= result.color;
                    } else if (result.material === 2 || result.material === 4) {
                        let fuzz = 0;
                        if (result.material === 4) {
                            fuzz = 2;
                        }
                        scattered_direction = reflect(
                            scattered_direction.normalized(),
                            result.hit_point_normal
                        );
                        if (sample_on_unit_sphere_surface) {
                            scattered_direction += fuzz * random_unit_vector();
                        } else {
                            scattered_direction += fuzz * random_in_unit_sphere();
                        }
                        scattered_origin = result.hit_point;
                        if (scattered_direction.dot(result.hit_point_normal) < 0) {
                            break;
                        } else {
                            brightness *= result.color;
                        }
                    } else if (result.material == 3) {
                        let refraction_ratio = 1.5;
                        if (result.front_face) {
                            refraction_ratio = 1 / refraction_ratio;
                        }
                        let cos_theta = min(
                            -scattered_direction.normalized().dot(result.hit_point_normal),
                            1.0
                        );
                        let sin_theta = sqrt(1 - cos_theta * cos_theta);
                        if (
                            refraction_ratio * sin_theta > 1.0 ||
                            reflectance(cos_theta, refraction_ratio) > ti.random()
                        ) {
                            scattered_direction = reflect(
                                scattered_direction.normalized(),
                                result.hit_point_normal
                            );
                        } else {
                            scattered_direction = refract(
                                scattered_direction.normalized(),
                                result.hit_point_normal,
                                refraction_ratio
                            );
                        }
                        scattered_origin = result.hit_point;
                        brightness *= result.color;
                    }
                    brightness /= p_RR;
                }
            }
            n += 1;
        }

        return color_buffer;
    });

    ti.addToKernelScope({
        ran3,
        random_unit_vector,
        random_in_unit_sphere,
        reflect,
        refract,
        reflectance,
        ray_color,
    });

    let render = ti.kernel((t) => {
        for (let p of ndrange(image_width, image_height)) {
            let i = p[0];
            let j = p[1];
            let u = (i + ti.random()) / image_width;
            let v = (j + ti.random()) / image_height;
            let color = [0.0, 0.0, 0.0];
            for (let n of range(samples_per_pixel)) {
                let ray = get_camera_ray(u, v);
                color += ray_color(ray);
            }
            color /= samples_per_pixel;
            pixels[p] += color;
        }
    });

    let htmlCanvas = document.getElementById("result_canvas");
    htmlCanvas.width = image_width;
    htmlCanvas.height = image_height;
    let canvas = new ti.Canvas(htmlCanvas);

    let pixelsToRender = ti.Vector.field(3, ti.f32, [image_width, image_height]);
    ti.addToKernelScope({ pixelsToRender });
    let pixelsFormat = ti.kernel((t) => {
        for (let p of ti.ndrange(image_height, image_width)) {
            pixelsToRender[p] = sqrt(pixels[p] / t);
        }
    });

    let i = 0;
    async function frame() {
        if (window.shouldStop) {
            return;
        }
        render(i);
        i += 1;
        pixelsFormat(i);
        canvas.setImage(pixelsToRender);
        cancelID = requestAnimationFrame(frame);
    }
    await frame();
};
