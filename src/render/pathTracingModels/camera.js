import * as ti from "taichi.js/dist/taichi";

export let get_camera_ray = (u, v) => {
    let fov = 60.0;
    let aspect_ratio = 1.0;
    let lookfrom = [0, 1.0, -7.5];
    let lookat = [0.0, 1.0, -1.0];
    let vup = [0.0, 1.0, 0.0];
    let theta = fov * (Math.PI / 180.0);
    let half_height = Math.tan(theta / 2.0);
    let half_width = aspect_ratio * half_height;
    let cam_origin = lookfrom
    let _w = (lookfrom - lookat).normalized()
    let _u = (vup.cross(_w)).normalized();
    let _v = ti.cross(_w, _u)
    let cam_lower_left_corner = cam_origin - half_width * _u - half_height * _v - _w;
    let cam_horizontal = 2 * half_width * _u;
    let cam_vertical = 2 * half_height * _v;
    return {
        origin: cam_origin,
        direction: cam_lower_left_corner + u * cam_horizontal + v * cam_vertical - cam_origin
    };
};

export const setupCamera = () => {
    ti.addToKernelScope({
        get_camera_ray
    })
}