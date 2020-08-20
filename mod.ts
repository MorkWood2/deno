//module allows filePath to be read by windows and mac
import { join } from "https://deno.land/std/path/mod.ts";
// BufReader implements buffering for a Reader object
import { BufReader } from "https://deno.land/std/io/bufio.ts";
//parse csv function
import { parse } from "https://deno.land/std/encoding/csv.ts";

import * as _ from "https://deno.land/x/lodash@4.17.15-es/lodash.js";

//define typescript interface

interface Planet {
  //each planet object is a string
  [key: string]: string;
}

async function loadPlanetsData() {
  //           join('currentDIR', 'fileName')
  const path = join(".", "kepler_exoplanets_nasa.csv");

  const file = await Deno.open(path);
  const bufReader = new BufReader(file);
  const result = await parse(bufReader, {
    //we want to parse header
    header: true,
    comment: "#",
  });
  //deno close to prevent memory leak
  Deno.close(file.rid);

  //                    type assertion
  const planets = (result as Array<Planet>).filter((planet) => {
    const plantaryRadius = Number(planet["koi_prad"]);
    const stellarMass = Number(planet["koi_smass"]);
    const stellarRadius = Number(planet["koi_srad"]);

    return planet["koi_disposition"] === "CONFIRMED" &&
      plantaryRadius > 0.5 && plantaryRadius < 1.5 &&
      stellarMass > 0.78 && stellarMass < 1.04 &&
      stellarRadius > 0.99 && stellarRadius < 1.01;
  });

  return planets.map((planet) => {
    return _.pick(planet, [
      "koi_prad",
      "koi_smass",
      "koi_srad",
      "kepler_name",
      "koi_count",
      "koi_steff",
    ]);
  });
}

const newEarths = await loadPlanetsData();

//  iterating all values of array
for (const planet of newEarths) {
  console.log(planet);
}

console.log(`${newEarths.length} habitable planets found!`);
