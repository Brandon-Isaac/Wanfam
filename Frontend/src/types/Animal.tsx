  type Animal = {
    id: string;
    name: string;
    type: string;
    breed: string;
    gender: string;
    tag: string;
    birthDate: Date;
    purchaseDate: Date;
    notes: string;
    assignedWorker?:{
      firstName: string;
      lastName: string;
      id: string;
    }
    createdAt: Date;
    updatedAt: Date;
    age: string | number;
    weight: number | null;
    latestMilkProduction: number | null;
    healthStatus?: string | null;
  };

export default Animal;