type VaccinationSchedule = {
    _id: string;
    farmId: string;
    animalId:{
        tagId: string;
        name: string;
        _id: string;
    }
    animalName: string;
    scheduleName: string;
    vaccinationTime: Date;
    status: 'pending' | 'completed' | 'missed';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
};

export default VaccinationSchedule;