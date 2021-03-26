import { DeleteDishInput, DeleteDishOutput } from './dtos/detele-dish.dto';
import { EditDishInput, EditDishOutput } from './dtos/edit-dish.dto';
import { Dish } from './entities/dish.entity';
import { CreateDishInput, CreateDishOutput } from './dtos/create-dish.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
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
import { ILike, Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Category } from './entities/category.entity';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { CategoryRepository } from './repositories/category.repository';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { RestaurantOutput, RestaurauntInput } from './dtos/restaurant.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dtos/search-restaurant.dto';

const ITEMS_PER_PAGE = 6;

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
    private readonly categories: CategoryRepository,
  ) {}

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
          createRestaurantInput.categoryImage,
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
          editRestaurantInput.categoryImage,
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

  countRestaurants(category: Category): Promise<number> {
    return this.restaurants.count({ category });
  }

  async getCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      let category = await this.categories.findOne(
        { slug },
        { relations: ['restaurants'] },
      );
      if (category) {
        const restaurants = await this.restaurants.find({
          where: {
            category,
          },
          take: ITEMS_PER_PAGE,
          skip: ITEMS_PER_PAGE * (page - 1),
          order: {
            isPromoted: 'DESC',
          },
        });

        let totalResults = await this.countRestaurants(category);
        return {
          ok: true,
          error: null,
          restaurants,
          category,
          totalPages: Math.ceil(totalResults / ITEMS_PER_PAGE),
        };
      } else {
        return { ok: false, error: 'Category was not found' };
      }
    } catch (error) {
      return { ok: false, error: 'Could not find category by given slug' };
    }
  }

  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        take: ITEMS_PER_PAGE,
        skip: (page - 1) * ITEMS_PER_PAGE,
        order: { isPromoted: 'DESC' },
      });
      return {
        ok: true,
        error: null,
        totalPages: Math.ceil(totalResults / ITEMS_PER_PAGE),
        results: restaurants,
        totalResults,
      };
    } catch (error) {
      return { ok: false, error: 'No restaurants found' };
    }
  }

  async findRestaurantById({
    restaurantId,
  }: RestaurauntInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId, {
        relations: ['menu'],
      });
      if (!restaurant) {
        return {
          ok: false,
          error: 'Failed to find restaurant',
        };
      }
      return {
        ok: true,
        error: null,
        restaurant,
      };
    } catch (error) {
      return { ok: false, error: 'Restaurant with given ID was not found.' };
    }
  }

  async searchRestaurantsByName({
    query,
    page,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const [restaurants, totalCount] = await this.restaurants.findAndCount({
        where: { name: ILike(`%${query}%`) },
        take: ITEMS_PER_PAGE,
        skip: (page - 1) * ITEMS_PER_PAGE,
        order: { isPromoted: 'DESC' },
      });
      return {
        ok: true,
        error: null,
        results: restaurants,
        totalResults: totalCount,
        totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
      };
    } catch (error) {
      return {
        ok: false,
        error: 'No results match your query parameter',
      };
    }
  }

  async createDish(
    owner: User,
    createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        createDishInput.restaurantId,
      );
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant Not Found!',
        };
      }
      if (owner.id !== restaurant.ownerId) {
        return { ok: false, error: 'You are not an owner of this restaurant!' };
      }
      const dish = await this.dishes.save(
        this.dishes.create({ ...createDishInput, restaurant }),
      );
      return {
        ok: true,
        error: null,
      };
    } catch (error) {
      return { ok: false, error: 'Could not create new dish!' };
    }
  }

  async editDish(
    owner: User,
    editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    try {
      const dish = await this.dishes.findOne(editDishInput.dishId, {
        relations: ['restaurant'],
      });
      if (!dish) {
        return {
          ok: false,
          error: 'Dish has not been found in the Database!',
        };
      }
      console.log(dish);
      if (dish.restaurant.id !== owner.id) {
        return {
          ok: false,
          error: 'You have no rights to perform this operation!',
        };
      }
      await this.dishes.save([
        {
          id: editDishInput.dishId,
          ...editDishInput,
        },
      ]);
      return {
        ok: true,
        error: null,
      };
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error: 'Count not edit the dish!',
      };
    }
  }

  async deleteDish(
    owner: User,
    { dishId }: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    try {
      const dish = await this.dishes.findOne(dishId, {
        relations: ['restaurant'],
      });
      if (!dish) {
        return {
          ok: false,
          error: 'Dish has not been found!',
        };
      }
      if (dish.restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: 'You have not created this asset!',
        };
      }
      await this.dishes.delete(dishId);
      return {
        ok: true,
        error: null,
      };
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error: 'Could not delete the dish!',
      };
    }
  }
}
