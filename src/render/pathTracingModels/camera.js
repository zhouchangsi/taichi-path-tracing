import * as ti from "taichi.js/dist/taichi";

export let get_camera_ray = (u, v) => {
    let fov = 60.0;
    let aspect_ratio = 1.0;
    let lookfrom = [0.0, 1.0, -5.0];
    let lookat = [0.0, 1.0, -1.0];
    let vup = [0.0, 1.0, 0.0];
    let theta = fov * (Math.PI / 180.0);
    let half_height = Math.tan(theta / 2.0);
    let half_width = aspect_ratio * half_height;
    let cam_origin = lookfrom
    // let _w = ti.normalized(ti.sub(lookfrom, lookat));
    // let _u = ti.normalized(ti.cross(vup, _w));
    // let _v = ti.cross(_w, _u);
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
// let lookfrom = ti.Vector.field(3, ti.f32, [1])
// let lookat = ti.Vector.field(3, ti.f32, [1])
// let vup = ti.Vector.field(3, ti.f32, [1])
// let cam_lower_left_corner = ti.Vector.field(3, ti.f32, [1])
// let cam_horizontal = ti.Vector.field(3, ti.f32, [1])
// let cam_vertical = ti.Vector.field(3, ti.f32, [1])
// let cam_origin = lookfrom

// lookfrom[0] = [0.0, 1.0, -5.0]
// lookat[0] = [0.0, 1.0, -1.0];
// vup[0] = [0.0, 1.0, 0.0];

// // let _w = ti.normalized(ti.sub(lookfrom, lookat));
// // let _u = ti.normalized(ti.cross(vup, _w));
// // let _v = ti.cross(_w, _u);
// let get_camera_ray = ti.func((u, v) => {
//     let PI = 3.1415926
//     let fov = 60.0;
//     let aspect_ratio = 1.0;
//     let theta = fov * (PI / 180.0);
//     let half_height = tan(theta / 2.0);
//     let half_width = aspect_ratio * half_height;
//     let _w = (lookfrom[0] - lookat[0]).normalized()
//     let _u = (vup[0].cross(_w)).normalized();
//     let _v = _w.cross(_u)
//     cam_lower_left_corner[0] = cam_origin[0] - half_width * _u - half_height * _v - _w;
//     cam_horizontal[0] = 2 * half_width * _u;
//     cam_vertical[0] = 2 * half_height * _v;
//     return (
//         cam_lower_left_corner[0] + u * cam_horizontal[0] + v * cam_vertical[0] - cam_origin[0]
//     );
// });
// ti.addToKernelScope({
//     lookfrom,
//     lookat,
//     vup,
//     cam_horizontal,
//     cam_lower_left_corner,
//     cam_origin,
//     cam_vertical,
//     get_camera_ray,
// })
