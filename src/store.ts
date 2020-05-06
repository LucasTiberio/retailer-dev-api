import DataLoader from 'dataloader';
import { v4 as uuid } from 'uuid';

const attrReader = (attr : any) => (r : any) => r[attr];

const _groupBy = (array : any, keyFunc: any) => {
  let vals: any = {};
  array.forEach((val: any) => {
    let key = keyFunc(val);
    if (vals[key]) {
      vals[key].push(val);
    } else {
      vals[key] = [val];
    }
  });
  return vals;
};

let stores : any = {};

const registerStore = (loadFn : any) => {
  const lid: string = uuid();
  return () => {
    if(!(lid in stores)) {
      stores[lid] = new DataLoader(loadFn);
    }
    return stores[lid];
  };
};

const resetStores = () => {
  stores = {};
};


const registerOneToOneLoader = 
(queryFn: any, recordKey: any, wrapper: any) => registerStore(async (keys : Array<Number>) => {
  let result = await queryFn(keys);
  let byKey : any = {};
  result.forEach((el: any) => {
    byKey[el[recordKey]] = el;
  });
  if(!wrapper) {
    return keys.map(k => byKey[k.toString()] || null);
  } 
  return keys.map(k => byKey[k.toString()] ? wrapper(byKey[k.toString()]) : null);
});

const registerOneToManyLoader = 
(queryFn: any, recordKey: any, wrapper: any) => registerStore(async (keys: Array<Number>) => {
  let result = await queryFn(keys);
  let grouped : any = _groupBy(result, attrReader(recordKey));
  if(!wrapper){
    return keys.map(k => grouped[k.toString()] || []);
  }
  return keys.map(k => grouped[k.toString()] ? grouped[k.toString()].map(wrapper) : []);
});

export default {
  registerOneToOneLoader,
  registerOneToManyLoader,
  registerStore,
  resetStores,
};
