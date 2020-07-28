export default {
  // Extend obj – same as jQuery.extend({}, objA, objB)
  extend(obj: { [propName: string]: string | number }, ...args: any[]): { [propName: string]: string | number } {
    obj = obj || {}
    for (let i = 1; i < args.length; i++) {
      if (!args[i]) {
        continue
      }
      for (const key in args[i]) {
        if (args[i].hasOwnProperty(key)) {
          obj[key] = args[i][key]
        }
      }
    }
    return obj
  },
}
