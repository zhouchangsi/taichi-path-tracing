import * as ti from 'taichi.js/dist/taichi'

export let V3 = () => {
  return [0.0, 0.0, 0.0]
}

export let Ray = ti.func((origin, direction) => {
  return { origin, direction }
})


export let Sphere = ti.func(() => {
  return {
    center: V3,
    radius: ti.f32,
    material: ti.i32,
    color: V3,
  }
})


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
    hit_point = ray.at(root);
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

export let setupSphere = () => {
  ti.addToKernelScope({
    V3,
    Ray,
    Sphere,
    hit_sphere
  })
}