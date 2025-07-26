import { importAllSets } from './import_sets.js';
import { importSetBySet } from './import_set_by_set.js';
import { importOneSet } from './import_one_set.js';


//importAllSets();
/*
const selectedSet = {
    "code": "10e",
    "name": "Tenth Edition",
    "icon_svg_uri": "https://svgs.scryfall.io/sets/10e.svg?1753070400",
    "uri": "https://api.scryfall.com/cards/search?order=set&q=e%3A10e&unique=prints",
    "released_at": "2007-07-13"
};
importOneSet(selectedSet);*/

importSetBySet();