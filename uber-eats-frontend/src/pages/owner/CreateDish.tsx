import { useMutation } from "@apollo/client";
import { motion } from "framer-motion";
import gql from "graphql-tag";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory, useParams } from "react-router";
import FormError from "../../components/FormError";
import MainButton from "../../components/MainButton";
import Container from "../../components/reusable/Container";
import ToastFactory from "../../utils/messaging/toasts";
import {
  createDish,
  createDishVariables,
} from "../../__api_schema_typed__/createDish";
import { QUERY_MY_RESTAURANT } from "./SingleRestaurant";
import { AiOutlineDelete } from "react-icons/ai";
import { FaHandPointer } from "react-icons/fa";
import NoCoverSelected from "../../images/cover_not_select.svg";
import {
  DishChoiceInputType,
  DishOptionInputType,
} from "../../__api_schema_typed__/globalTypes";

const CREATE_DISH_MUTATION = gql`
  mutation createDish($input: CreateDishInput!) {
    createDish(input: $input) {
      ok
      error
    }
  }
`;

interface CreateMenuItemInterface {
  name: string;
  price: number;
  description: string;
  image?: FileList;
}

interface OptionChoice extends DishChoiceInputType {
  id: string;
}

interface OptionsProps extends DishOptionInputType {
  id: string;
  name: string;
  extra: number;
  choices?: OptionChoice[] | undefined;
}

const CreateDish = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const history = useHistory();
  const [options, setOptions] = useState<OptionsProps[]>([]);
  const {
    getValues,
    errors,
    setError,
    handleSubmit,
    register,
    watch,
  } = useForm<CreateMenuItemInterface>({ mode: "onBlur" });
  const [createMenuItem] = useMutation<createDish, createDishVariables>(
    CREATE_DISH_MUTATION,
    {
      onCompleted,
      refetchQueries: [
        {
          query: QUERY_MY_RESTAURANT,
          variables: { input: { id: +restaurantId } },
        },
      ],
    }
  );

  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | ArrayBuffer | null>(
    null
  );
  const imageChangeWatcher = watch("image");
  useEffect(() => {
    const { image } = getValues();
    if (image?.[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setPreviewImage(reader.result);
        }
      };
      reader.readAsDataURL(image[0]);
    }
  }, [imageChangeWatcher, getValues]);

  function onCompleted(data: createDish) {
    const {
      createDish: { ok },
    } = data;
    if (ok) {
      setUploadingImage(false);
      new ToastFactory("Menu item was created!").showSuccess();
      setTimeout(() => {
        history.goBack();
      }, 1300);
    }
  }
  const createSubmitMenuItem = async () => {
    const { image, name, description, price } = getValues();
    let imageWhiteSpaceConstraint;
    if (image) {
      imageWhiteSpaceConstraint = image[0].name.includes(" ");
    }
    if (imageWhiteSpaceConstraint) {
      setError("image", {
        type: "manual",
        message: "Restaurant image file can't contain whitespaces",
      });
      return;
    }
    setUploadingImage(true);
    let uploadedImageUrl;
    if (image?.length) {
      const itemImage = image[0];
      const itemImageForm = new FormData();
      itemImageForm.append("file", itemImage);
      const { imageUrl } = await (
        await fetch("http://localhost:4000/uploads", {
          method: "POST",
          body: itemImageForm,
        })
      ).json();
      uploadedImageUrl = imageUrl;
    }
    createMenuItem({
      variables: {
        input: {
          restaurantId: +restaurantId,
          name,
          price: +price,
          description,
          ...(image && { photo: uploadedImageUrl }),
          ...(options && { options: options }),
        },
      },
    });
  };

  const addOption = () => {
    setOptions([
      ...options,
      { id: Math.random().toString(36).slice(0, 6), name: "", extra: 0 },
    ]);
  };
  const removeOption = (id: string | undefined) => {
    setOptions(options.filter((op) => op.id !== id));
  };
  const setOptionsDetails = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string | undefined
  ) => {
    setOptions(
      options.map((op) =>
        op.id === id
          ? {
              ...op,
              [e.target.name]:
                e.target.name === "extra" ? +e.target.value : e.target.value,
            }
          : op
      )
    );
  };

  const setVariantsForOption = (id: string | undefined) => {
    setOptions(
      options.map((op) =>
        op.id === id && op.choices
          ? {
              ...op,
              choices: [
                ...op.choices,
                {
                  id: Math.random().toString(36).slice(0, 6),
                  name: "",
                  extra: 0,
                },
              ],
            }
          : op.id === id && !op?.choices?.length
          ? {
              ...op,
              choices: [
                {
                  id: Math.random().toString(36).slice(0, 6),
                  name: "",
                  extra: 0,
                },
              ],
            }
          : op
      )
    );
  };

  const setVariantDetail = (
    e: React.ChangeEvent<HTMLInputElement>,
    optionId: string | undefined,
    variantId: string | undefined
  ) => {
    setOptions(
      options.map((op) =>
        op.id === optionId
          ? {
              ...op,
              choices: op.choices?.map((c) =>
                c.id === variantId
                  ? {
                      ...c,
                      [e.target.name]:
                        e.target.name === "extra"
                          ? +e.target.value
                          : e.target.value,
                    }
                  : c
              ),
            }
          : op
      )
    );
  };

  const removeOptionChoice = (
    optionId: string | undefined,
    choiceId: string | undefined
  ) => {
    setOptions(
      options.map((op) =>
        op.id === optionId
          ? { ...op, choices: op.choices?.filter((c) => c.id !== choiceId) }
          : op
      )
    );
  };
  console.log(errors);

  return (
    <div className="bg-gray-100 h-full">
      <Container>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex flex-col items-center"
        >
          <h2 className="my-10 text-2xl font-extrabold text-gray-600">
            Create Menu Item
          </h2>
          <form
            onSubmit={handleSubmit(createSubmitMenuItem)}
            className="w-full sm:w-6/12 flex flex-col h-3/6 justify-between shadow-lg bg-gray-50 sm:rounded-md sm:overflow-hidden p-10 mb-48"
          >
            <input
              name="name"
              ref={register({ required: "Name is a required field" })}
              className="input w-full p-3 mt-8"
              type="text"
              placeholder="Menu item name"
            />
            <div className="mt-3">
              {errors.name && (
                <FormError message="Name is a required field and no shorter than 3 letters" />
              )}
            </div>
            <input
              name="price"
              ref={register({ required: "Price should be specified" })}
              min={1}
              className="input w-full p-3 mt-8"
              type="number"
              placeholder="Menu item price"
            />
            <div className="mt-3">
              {errors.price && (
                <FormError message="Price is a required field" />
              )}
            </div>
            <textarea
              cols={10}
              name="description"
              ref={register({ required: true })}
              className="input w-full p-3 mt-8"
              placeholder="Description"
            />
            <div className="mt-3">
              {errors.description && (
                <FormError message="Description is a required field and can't be shorter than 5 letters" />
              )}
            </div>
            <div className="mt-4 flex items-center flex-col-2">
              {previewImage ? (
                <img
                  alt="dish preview"
                  src={`${previewImage}`}
                  className="w-1/2 rounded-md mr-2 h-32 sm:h-48"
                />
              ) : (
                <img
                  src={NoCoverSelected}
                  alt="cover not selected area"
                  className="w-1/2 rounded-md mr-2 h-48"
                />
              )}
              <div>
                <label
                  className="text-emerald-700 text-center text-sm"
                  htmlFor="image"
                >
                  {previewImage
                    ? "You can select another image by pressing Choose file"
                    : "Select cover image for the item"}
                </label>
                <input
                  ref={register}
                  type="file"
                  name="image"
                  accept="image/*"
                  className="input w-full mt-2 mb-5 p-3 text-xs"
                />
                {errors.image && errors.image.type === "manual" && (
                  <FormError message="Restaurant image file can't contain whitespaces" />
                )}
              </div>
            </div>
            <div className="w-1/2 p-4">
              <button
                type="button"
                className="bg-purple-500 text-white p-2 rounded-md h-10 text-sm md:text-xl md:h-14"
                onClick={addOption}
              >
                <span className="animate-pulse">Add Option</span>
              </button>
            </div>
            <div className="flex flex-col">
              {options.length > 0 &&
                options.map((option) => (
                  <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    key={option.id}
                  >
                    <div className="mt-3 flex justify-between">
                      <div className="p-2 flex items-center justify-center align-center bg-emerald-200 rounded-md shadow-md">
                        <div className="w-full max-w-xs mx-auto">
                          <div>
                            <label
                              htmlFor="name"
                              className="text-sm font-medium text-gray-700"
                            >
                              Option
                            </label>
                            <div className="mt-1 rounded-md shadow-sm">
                              <input
                                type="text"
                                name="name"
                                onChange={(e) =>
                                  setOptionsDetails(e, option?.id)
                                }
                                className="focus:ring-indigo-500 focus:border-indigo-500 w-full  py-1 sm:pl-2 sm:text-sm border-gray-500 rounded-md"
                                placeholder="www.example.com"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-2 flex items-center justify-center bg-emerald-200 rounded-md shadow-md">
                        <div className="w-full max-w-xs mx-auto">
                          <div>
                            <label
                              htmlFor="company_website"
                              className="text-sm font-medium text-gray-700"
                            >
                              Extra price
                            </label>
                            <div className="mt-1 rounded-md shadow-sm">
                              <input
                                type="number"
                                name="extra"
                                onChange={(e) =>
                                  setOptionsDetails(e, option?.id)
                                }
                                min={0}
                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full h-full py-1 sm:pl-2 sm:text-sm border-gray-500 rounded-md"
                                placeholder="Extra price"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center p-3 ml-2 place-self-center border border-transparent rounded-full shadow-sm bg-pink-400 h-9 w-9 text-white  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => removeOption(option?.id)}
                      >
                        <AiOutlineDelete size={30} color="white" />
                      </button>
                    </div>
                    <div className="flex items-center">
                      <button
                        type="button"
                        className="bg-blue-400 mt-3 p-1 rounded justify-self-start ml-4"
                        onClick={() => setVariantsForOption(option?.id)}
                      >
                        <span className="animate-pulse text-white font-semibold">
                          Create Option Variants
                        </span>
                      </button>
                      <h2 className="font-semibold mt-4 justify-self-end ml-10">
                        {option?.name.length > 0 && (
                          <span className="font-bold flex text-emerald-700">
                            <FaHandPointer
                              size={20}
                              className="mr-2 transform -rotate-45"
                            />
                            for "{option?.name}"
                          </span>
                        )}
                      </h2>
                    </div>
                    {option?.choices?.length !== 0 &&
                      option?.choices?.map((choice) => {
                        return (
                          <motion.div
                            initial={{ opacity: 0, y: -30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-2 ml-2 flex justify-between"
                          >
                            <div className="p-2 flex items-center justify-center align-center bg-gray-200 rounded-md shadow-md">
                              <div className="w-full max-w-xs mx-auto">
                                <div>
                                  <label
                                    htmlFor="company_website"
                                    className="text-sm font-medium text-gray-700"
                                  >
                                    Variant name
                                  </label>
                                  <div className="mt-1 rounded-md shadow-sm">
                                    <input
                                      type="text"
                                      name="name"
                                      onChange={(e) =>
                                        setVariantDetail(
                                          e,
                                          option?.id,
                                          choice?.id
                                        )
                                      }
                                      className="focus:ring-indigo-500 focus:border-indigo-500 w-full  py-1 sm:pl-2 sm:text-sm border-gray-500 rounded-md"
                                      placeholder="www.example.com"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="p-2 flex items-center justify-center bg-gray-200 rounded-md shadow-md">
                              <div className="w-full max-w-xs mx-auto">
                                <div>
                                  <label
                                    htmlFor="company_website"
                                    className="text-sm font-medium text-gray-700"
                                  >
                                    Extra price
                                  </label>
                                  <div className="mt-1 rounded-md shadow-sm">
                                    <input
                                      type="number"
                                      name="extra"
                                      onChange={(e) =>
                                        setVariantDetail(
                                          e,
                                          option?.id,
                                          choice?.id
                                        )
                                      }
                                      min={0}
                                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full h-full py-1 sm:pl-2 sm:text-sm border-gray-500 rounded-md"
                                      placeholder="Extra price"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="inline-flex items-center p-3 ml-2 place-self-center border border-transparent rounded-full shadow-sm bg-pink-400 h-9 w-9 text-white  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              onClick={() =>
                                removeOptionChoice(option?.id, choice?.id)
                              }
                            >
                              <AiOutlineDelete size={30} color="white" />
                            </button>
                          </motion.div>
                        );
                      })}
                  </motion.div>
                ))}
            </div>
            <MainButton
              loading={uploadingImage}
              text="Create"
              canBeClicked={true}
            />
          </form>
        </motion.div>
      </Container>
    </div>
  );
};

export default CreateDish;
