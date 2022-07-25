export function set(value, signature, obj) {
  const fieldPath = signature.split('.');

  // carry the pointer down the object
  let currRef = obj;

  for (const key of fieldPath) {
    if (!currRef[key]) {
      currRef[key] = {};
    }

    // If at the end of the path, set the value
    if (fieldPath.indexOf(key) === fieldPath.length - 1) {
      currRef[key] = value;
    } else {
      // update the reference to be the next
      // level down the fieldPath
      currRef = currRef[key];
    }
  }

  return obj;
}
