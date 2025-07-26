import {importAllSets} from './import_sets.js';
import {importOneSet} from './import_one_set.js';
import { importSetBySet } from './import_set_by_set.js';

const selectedSet = {
  code: "ltr",
  name: "The Lord of the Rings: Tales of Middle-earth",
  icon_svg_uri: "https://svgs.scryfall.io/sets/ltr.svg?1753070400",
  uri: "https://api.scryfall.com/cards/search?order=set&q=e%3Altr&unique=prints",
  released_at: "2023-06-23"
};
//importAllSets();
//importOneSet(selectedSet);
importSetBySet();