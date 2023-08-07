import * as ti from 'taichi.js/dist/taichi'

export let Sphere = ti.types.struct({
    center: ti.types.vector(ti.f32, 3),
    radius: ti.f32,
    material: ti.i32,
    color: ti.types.vector(ti.f32, 3),
})

export let objects = ti.field(Sphere, 10)

export let hit_sphere = ti.func((ray, sphere, t_min, t_max) => {
    let oc = ray.origin - sphere.center;
    let a = ray.direction.dot(ray.direction);
    let b = 2.0 * oc.dot(ray.direction);
    let c = oc.dot(oc) - sphere.radius * sphere.radius;
    let discriminant = b * b - 4 * a * c;
    let is_hit = false;
    let front_face = false;
    let root = 0.0;
    let hit_point = [0.0, 0.0, 0.0]
    let hit_point_normal = [0.0, 0.0, 0.0];

    if (discriminant > 0) {
        const sqrtd = sqrt(discriminant);
        root = (-b - sqrtd) / (2 * a);
        if (root < t_min || root > t_max) {
            root = (-b + sqrtd) / (2 * a);
            if (root >= t_min && root <= t_max) {
                is_hit = true;
            }
        } else {
            is_hit = true;
        }
    }

    if (is_hit) {
        hit_point = ray_at(ray, root);
        hit_point_normal = (hit_point - sphere.center) / sphere.radius;
    }

    if (ray.direction.dot(hit_point_normal) < 0) {
        front_face = true;
    } else {
        hit_point_normal = -hit_point_normal;
    }

    return {
        is_hit,
        root,
        hit_point,
        hit_point_normal,
        front_face,
        material: sphere.material,
        color: sphere.color,
    };

})

export let hit_objects = ti.func((ray, t_min = 0.001, t_max = 10e8) => {
    let closest_t = t_max;
    let is_hit = false;
    let front_face = false;
    let hit_point = [0.0, 0.0, 0.0];
    let hit_point_normal = [0.0, 0.0, 0.0];
    let color = [0.0, 0.0, 0.0];
    let material = 1;

    for (let i of ti.range(10)) {
        const result = hit_sphere(ray, objects[i], t_min, closest_t)

        if (result.is_hit) {
            closest_t = result.root;
            is_hit = result.is_hit;
            hit_point = result.hit_point;
            hit_point_normal = result.hit_point_normal;
            front_face = result.front_face;
            material = result.material;
            color = result.color;
        }
    }
    return { is_hit, hit_point, hit_point_normal, front_face, material, color };
})

export let ray_at = (ray, t) => {
    return ray.origin + t * ray.direction
}

export let setupScene = (brightness) => {
    objects.fromArray([
        { center: [0.0, 5.4, -1.0], radius: 3.0, material: 0, color: [brightness, brightness, brightness] },
        { center: [0, -100.5, -1], radius: 100.0, material: 2, color: [0.1, 0.1, 0.1] },
        { center: [0, 102.5, -1], radius: 100.0, material: 1, color: [0.8, 0.8, 0.8] },
        { center: [0, 1, 101], radius: 100.0, material: 1, color: [0.8, 0.8, 0.8] },
        { center: [-101.5, 0, -1], radius: 100.0, material: 2, color: [0.8, 0.5, 0.5] },
        { center: [101.5, 0, -1], radius: 100.0, material: 1, color: [0.0, 0.6, 0.0] },
        // Fuzz Metal
        { center: [-0.8, 0.2, -1], radius: 0.7, material: 4, color: [0.6, 0.8, 0.8] },
        // Glass
        { center: [0.7, 0, -0.5], radius: 0.5, material: 3, color: [1.0, 1.0, 1.0] },
        // Metal
        { center: [0, -0.2, -1.5], radius: 0.3, material: 2, color: [0.8, 0.3, 0.3] },
        // Diffuse
        { center: [0.6, -0.3, -2.0], radius: 0.2, material: 1, color: [0.8, 0.6, 0.2] },
    ])
    ti.addToKernelScope({
        objects,
        hit_sphere,
        hit_objects,
        ray_at
    })
}
