import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Category } from './entities/category.entity';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { CategoryRepository } from './repositories/category.repository';
import { AllCategoriesOutput } from './dtos/all-categories.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    private readonly categories: CategoryRepository,
  ) {}

  getAll(): Promise<Restaurant[]> {
    return this.restaurants.find();
  }
  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      let existingRestaurant = await this.restaurants.findOne({
        where: [
          { name: createRestaurantInput.name },
          { address: createRestaurantInput.address },
          { coverImage: createRestaurantInput.coverImage },
        ],
      });
      if (existingRestaurant) {
        console.log(existingRestaurant);
        return {
          ok: false,
          error:
            'Name, Address, or Cover Image already in use. Refused to create..',
        };
      } else {
        let newRestaurant = this.restaurants.create(createRestaurantInput);
        newRestaurant.owner = owner;

        const category = await this.categories.getOrCreate(
          createRestaurantInput.categoryName,
        );
        newRestaurant.category = category;
        await this.restaurants.save(newRestaurant);
        return {
          ok: true,
          error: null,
        };
      }
    } catch (error) {
      return {
        ok: false,
        error: 'Could not create new restaurant',
      };
    }
  }

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        editRestaurantInput.restaurantId,
        { loadRelationIds: true },
      );
      if (!restaurant) {
        return { ok: false, error: 'Restaurant was not found...' };
      }
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error:
            'Not enough rights for editing. Probably this entity was not created by you!',
        };
      }
      let category: Category = null;
      if (editRestaurantInput.categoryName) {
        category = await this.categories.getOrCreate(
          editRestaurantInput.categoryName,
        );
      }
      await this.restaurants.save([
        {
          id: editRestaurantInput.restaurantId,
          ...editRestaurantInput,
          ...(category && { category }),
        },
      ]);
      return { ok: true, error: null };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async deleteRestaurant(
    owner: User,
    { restaurantId }: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId, {
        loadRelationIds: true,
      });
      if (!restaurant) {
        return { ok: false, error: 'Restaurant was not found...' };
      }
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error:
            'Not enough rights to delete restaurant. We are guessing that entity was not created by you!',
        };
      }
      await this.restaurants.delete(restaurantId);
      return { ok: true, error: null };
    } catch (error) {
      return {
        ok: false,
        error: 'Deletion failed!',
      };
    }
  }

  async getAllCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();
      return { ok: true, error: null, categories };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not find any categories',
      };
    }
  }

  countRestaurants(category: Category) {
    return this.restaurants.count({ category });
  }
}
