import * as ti from "taichi.js/dist/taichi";
import { get_camera_ray, setupCamera } from "./pathTracingModels/camera";
import { hit_objects, setupScene } from "./pathTracingModels/scene";

export const colorOnly = async () => {
    await ti.init();
    setupCamera()
    setupScene()

    const image_width = 600;
    const image_height = 600;
    const pixels = ti.Vector.field(3, ti.f32, [image_width, image_height]);
    const samples_per_pixel = 4;
    const max_depth = 10;
    ti.addToKernelScope({
        image_height,
        image_width,
        pixels,
        samples_per_pixel,
        max_depth,
    });

    let render = ti.kernel((t) => {
        for (let p of ndrange(image_width, image_height)) {
            let i = p[0]
            let j = p[1]
            let u = (i + ti.random()) / image_width;
            let v = (j + ti.random()) / image_height;
            let color = [0.0, 0.0, 0.0];
            for (let n of range(samples_per_pixel)) {
                let ray = get_camera_ray(u, v)
                color += hit_objects(ray, 0.001, 10e8).hit_point
            }
            color /= samples_per_pixel;
            pixels[p] += color;
        }
    });

    let htmlCanvas = document.getElementById("result_canvas");
    htmlCanvas.width = image_width;
    htmlCanvas.height = image_height;
    let canvas = new ti.Canvas(htmlCanvas);

    let pixelsToRender = ti.Vector.field(3, ti.f32, [image_width, image_height])
    ti.addToKernelScope({ pixelsToRender })
    let pixelsFormat = ti.kernel((t) => {
        for (let p of ti.ndrange(image_height, image_width)) {
            pixelsToRender[p] = sqrt(pixels[p] / t)
        }
    })

    let i = 0;
    async function frame() {
        if (window.shouldStop) {
            return;
        }
        render(i);
        i += 1;
        pixelsFormat(i)
        canvas.setImage(pixelsToRender);
        requestAnimationFrame(frame);
    }
    await frame();
};