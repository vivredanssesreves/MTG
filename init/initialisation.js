import { importAllSets } from './import_sets.js';
import { importSetBySet } from './import_set_by_set.js';
import { importOneSet } from './import_one_set.js';


//await importAllSets();

const set = {
    "code": "ltr",
    "name": "The Lord of the Rings: Tales of Middle-earth",
    "icon_svg_uri": "https://svgs.scryfall.io/sets/ltr.svg?1753675200",
    "uri": "https://api.scryfall.com/cards/search?q=set:ltr&unique=prints&order=set",
    "uri_fr": "",
    "released_at": "2023-06-23",
    "cards_count": 856
};
//await importOneSet(set);

await importSetBySet();