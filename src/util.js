
export function doesSupport(dc, type) {
  let out = dc.supports.find(function(s) { return s.type === type;});
//  if (! out) {
//    let dcws = dc.supports.map(function(d) { return d.type; }).join(',');
//    console.log("not doesSupport "+dc.id+" "+dcws+" "+type+" undef");
//  }
  return typeof out != 'undefined';
}

export function serviceHost(dc, type) {
  let does = doesSupport(dc, type);
  if (does) {
    return does.host ? does.host : dc.host;
  }
  return null;
}

export let DS = "fdsnws-dataselect";
export let EV = "fdsn-event";
export let ST = "fdsn-station";
