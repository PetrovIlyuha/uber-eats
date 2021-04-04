import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { motion } from 'framer-motion';
import gql from 'graphql-tag'
import React, { useEffect, useRef, useState } from 'react'
import Autocomplete from 'react-autocomplete'
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { BiRightArrowCircle } from 'react-icons/bi';
import { useHistory } from 'react-router';
import FormError from '../../components/FormError';
import MainButton from '../../components/MainButton';
import Container from '../../components/reusable/Container'
import ToastFactory from '../../utils/messaging/toasts';
import { allCategories } from '../../__api_schema_typed__/allCategories';
import { createRestaurant, createRestaurantVariables } from '../../__api_schema_typed__/createRestaurant';
import { OWNER_RESTAURANTS } from './MyRestaurants'

const CREATE_RESTAURANT_MUTATION = gql`
  mutation createRestaurant($input: CreateRestaurantInput!) {
    createRestaurant(input: $input) {
        ok
        error
        restaurantId
      }
   }
`;

const GET_ALL_CATEGORIES = gql`
  query allCategories {
    allCategories {
      ok
      categories {
        id
        name
        coverImage
        slug
      }
      error
    }
  }
`

interface CreateRestaurantFormInterface {
  name: string;
  coverImage: string;
  address: string;
  categoryName: string;
  image: FileList
  categoryImage?: FileList | undefined
}

interface AutoCompleteOption {
  name: string;
  image: string;
}

const AddRestaurant = () => {
  const [categoryName, setCategoryName] = useState<string>('')
  const history = useHistory()
  const client = useApolloClient()
  const [categoriesAutoCompletions, setCategoriesAutoCompletions] = useState<AutoCompleteOption[]>([])

  const [create, { data, loading, error }] = useMutation<createRestaurant, createRestaurantVariables>(
    CREATE_RESTAURANT_MUTATION,
    {
      onCompleted,
      refetchQueries: [{ query: OWNER_RESTAURANTS }]
    })

  const { data: categories, loading: loadingCategories, error: errorLoadingCategories } = useQuery<allCategories>(GET_ALL_CATEGORIES)
  const { register, getValues, setValue, errors, setError, handleSubmit, formState } = useForm<CreateRestaurantFormInterface>({ mode: "onBlur" })

  const [uploadingImage, setUploadingImage] = useState<boolean>(false)

  function onCompleted(data: createRestaurant) {
    const { createRestaurant: { ok, error } } = data
    if (ok) {
      setUploadingImage(false)
      new ToastFactory("New Restaurant was created!").showSuccess()
      setTimeout(() => {
        history.push('/')
      }, 1300);
    }
  }
  const createOnSubmit = async () => {
    const { image, name, categoryName, address, categoryImage } = getValues()
    let imageWhiteSpaceConstraint = image[0].name.includes(' ')
    let categoryImageWhiteSpaceConstraint = categoryImage?.[0]?.name.includes(' ') || false
    if (imageWhiteSpaceConstraint) {
      setError('image', { type: 'manual', message: "Restaurant image file can't contain whitespaces" })
      return
    }
    if (categoryImageWhiteSpaceConstraint) {
      setError("categoryImage", { type: "manual", message: "Category image file can't contain whitespaces" })
      return
    }
    setUploadingImage(true)
    let categoryImageUrl
    if (categoryImage?.length) {
      const categoryImageFile = categoryImage[0]
      const categoryImageForm = new FormData()
      categoryImageForm.append('file', categoryImageFile)
      const { imageUrl } = await (await fetch('http://localhost:4000/uploads', {
        method: "POST",
        body: categoryImageForm
      })).json()
      categoryImageUrl = imageUrl
    }
    const fileToUpload = image[0]
    const formBody = new FormData()
    formBody.append('file', fileToUpload)
    const { imageUrl: coverImageUrl } = await (await fetch("http://localhost:4000/uploads", {
      method: 'POST',
      body: formBody
    })).json();
    create({
      variables: {
        input: {
          name,
          coverImage: coverImageUrl,
          address,
          categoryName,
          ...(categoryImageUrl && { categoryImage: categoryImageUrl })
        }
      }
    })
  }

  useEffect(() => {
    if (data?.createRestaurant?.error) {
      new ToastFactory(data.createRestaurant.error).showError()
    }
  }, [data])

  useEffect(() => {
    if (categories && categories?.allCategories && categories?.allCategories?.categories) {
      setCategoriesAutoCompletions(categories?.allCategories?.categories?.map(c => ({ name: c.name, image: c.coverImage, key: c.name })))
    }
  }, [categories])

  return (
    <div className="h-screen bg-gray-100">
      <Container>
        <Helmet>
          <title>Create Restaurant | Grabs Eaters</title>
        </Helmet>
        <motion.div initial={{ opacity: 0, x: 80, y: -30 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }} className="flex flex-col w-full items-center">
          <h2 className="text-2xl my-10">Add new restaurant</h2>
          <form onSubmit={handleSubmit(createOnSubmit)} className="w-6/12 flex flex-col h-3/6 justify-between mb-10">
            <input name="name" ref={register({ required: "Name is a required field" })} className="input w-full p-3" type="text" placeholder="Restaurant name" />
            <div className="mt-2">
              {errors.name && <FormError message="Name is a required field" />}
            </div>
            <input name="address" ref={register({ required: "Address should be specified" })} className="input w-full mt-10 p-3" type="text" placeholder="Restaurant Legal Address" />
            <div className="mt-2">
              {errors.address && <FormError message={`Address should be specified`} />}
            </div>
            <label className="text-emerald-700 mt-8" htmlFor="image">Select cover image for the restaurant</label>
            <input ref={register({ required: true })} type="file" name="image" accept="image/*" className="input w-full mt-2 p-3" placeholder="select image for restaurant" />
            {errors.image && errors.image.type === 'required' && <FormError message="Image should be provided" />}
            {errors.image && errors.image.type === 'manual' && <FormError message="Restaurant image file can't contain whitespaces" />}
            <h2 className="my-4 text-emerald-700 flex">
              <BiRightArrowCircle
                className="animate-pulse mr-4"
                size={30}
                style={{ marginLeft: 10, transform: 'rotate(90deg)' }}
                color="green"
              />
            Select Category from existing ones
          </h2>
            <Autocomplete
              getItemValue={(item: AutoCompleteOption) => item.name}
              items={categoriesAutoCompletions}
              inputProps={{ style: { background: 'white', marginBottom: 20, border: '1px dotted grey', borderRadius: '5px', width: "50%", position: 'relative' } }}
              menuStyle={{
                height: 0
              }}
              renderItem={(item, isHighlighted: boolean) =>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  style={{
                    background: isHighlighted ? 'lightgreen' : 'white',
                    padding: "4px 0px 4px 20px",
                    width: "50%",
                    position: 'relative',
                    top: -46,
                    left: -3,
                    border: "1px solid grey",
                    borderRadius: 2,
                    margin: 2,
                    boxShadow: '2px 2px 6px rgba(0,0,0,0.15)'
                  }}>
                  {item.name}
                </motion.div>
              }
              value={categoryName}
              onChange={(e) => {
                setCategoryName(e.target.value)
                setValue('categoryName', e.target.value)
              }
              }
              onSelect={(val) => setValue('categoryName', val)}
            />
            <h2 className="mb-4 text-emerald-700">Or create new Category below</h2>
            <input name="categoryName" ref={register({ required: "You should provide category name" })} className="input w-full my-5 p-3" type="text" placeholder="Restaurant category name" />
            {errors?.categoryName && <FormError message="Category name should be selected" />}
            <label htmlFor="categoryImage">Select Image for new category</label>
            <input name="categoryImage" ref={register} accept="image/*" className="input w-full my-5 p-3" type="file" />
            {errors.categoryImage?.type === 'manual' && <FormError message="Category image file can't contain whitespaces" />}
            <MainButton loading={uploadingImage} text="Create" canBeClicked={true} />
          </form>
        </motion.div>
      </Container>
    </div>
  )
}

export default AddRestaurant
