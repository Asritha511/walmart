import { gql } from 'apollo-server-express';
import fs from 'fs';
import path from 'path';
export const typeDefs = gql`
  type NutritionInfo {
    calories: Int
    fat: Int
    carbs: Int
    protein: Int
  }
  type Nutrition {
    dessert: String
    nutritionInfo: NutritionInfo
  }
  type Query {
    nutrition(dessert: String): [Nutrition]
  }
  type Mutation {
    addDessert(dessert: Dessert!) : [Nutrition]
    deleteDessert(desserts: [String]!) : [Nutrition]
    reset: [Nutrition]
  }
  input Dessert {
    dessert: String
    nutritionInfo: NutritionInfoInput
  }
  input NutritionInfoInput {
    calories: Int
    fat: Int
    carbs: Int
    protein: Int
  }
`;

interface Dessert {
  dessert?: string
  nutritionInfo?: {
    calories?: number
    fat?: number
    carbs?: number
    protein?: number
  }
}
type DessertInput = {
  dessert: string
}
type Desserts = {
  desserts: string[]
}
const dataFileName = './resources/nutrition-data-temp.json';
const bustAndRequire = () => {
  delete require.cache[require.resolve(dataFileName)];
  return require(dataFileName);
};
export const resolvers = {
  Query: {
    nutrition: (_, { dessert } : DessertInput) => {
      const data = bustAndRequire();
      if(dessert){
        const result = data.find((item: Dessert) => item.dessert === dessert);
        return [result];
      }
      return data;
    } 
  },
  Mutation: {
    addDessert: (_,  { dessert } : Dessert) => {
      const data = bustAndRequire();
      const newData = [
        ...data,
        dessert
      ];          
      fs.writeFile(path.join(__dirname, dataFileName), JSON.stringify(newData), () => {});
      return newData;
    },
    deleteDessert: (_, { desserts } : Desserts) => {
      if(desserts && desserts.length){
        const data = bustAndRequire();
        const newData = desserts.reduce((acc, curr) => {
          const index = acc.findIndex((item: Dessert) => item.dessert === curr);
          if(index!==-1) {
            return [
              ...acc.slice(0, index),
              ...acc.slice(index + 1)
            ];
          }
          return acc;
        }, data);
        fs.writeFile(path.join(__dirname, dataFileName), JSON.stringify(newData), () => {});
        return newData;
      }
    },
    reset: async () => {
      const { default: data } = await import('./resources/nutrition-data-perm.json');
      fs.writeFile(path.join(__dirname, dataFileName), JSON.stringify(data), () => {});
      return data;
    }
  }
}