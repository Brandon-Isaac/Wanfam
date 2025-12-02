import { Breed } from "../models/Breed";
import { asyncHandler } from "../middleware/AsyncHandler";
import { Request, Response } from "express";

const getBreedsForSpecies = asyncHandler(async (req: Request, res: Response) => {
    const { species } = req.params;
    if (!species) {
        return res.status(400).json({ message: 'Species is required' });
    }
    let breeds: string[];
    if (species === 'cattle'){
        breeds = ['Angus', 'Hereford', 'Holstein', 'Jersey', 'Charolais', 'Simmental', 'Limousin', 'Brahman', 'Texas Longhorn', 'Dexter'];
    }
    else if (species === 'sheep'){
        breeds = ['Merino', 'Suffolk', 'Dorset', 'Hampshire', 'Dorper', 'Katahdin', 'Texel', 'Romney', 'Cheviot', 'Jacob'];
    }
    else if (species === 'goat'){
        breeds = ['Boer', 'Nubian', 'Alpine', 'Saanen', 'Toggenburg', 'Kiko', 'LaMancha', 'Myotonic', 'Pygmy', 'Angora'];
    }
    else if (species === 'pig'){
        breeds = ['Yorkshire', 'Duroc', 'Berkshire', 'Hampshire', 'Landrace', 'Chester White', 'Poland China', 'Spotted', 'Tamworth', 'Large Black'];
    }
    else if (species === 'poultry'){
        breeds = ['Rhode Island Red', 'Leghorn', 'Plymouth Rock', 'Sussex', 'Orpington', 'Wyandotte', 'Cochin', 'Silkie', 'Australorp', 'Brahma'];
    }
    else {
        breeds = ['Mixed', 'Other'];
    }
    res.status(200).json({ breeds });

});

export default {
    getBreedsForSpecies
};