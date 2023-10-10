import { useEffect, useState } from "react";
import imgPlaceholder from "../assets/img/img-placeholder.jpg";

export default function PostForm({ savePost, post }) {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [image, setImage] = useState("");
    const [imageFile, setImageFile] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (post.title && post.body && post.image) {
            // if post, set the states with values from the post object.
            // The post object is a prop, passed from UpdatePage
            setTitle(post.title);
            setBody(post.body);
            setImage(post.image);
        }
    }, [post]); // useEffect is called every time post changes.

    /**
     * handleImageChange is called every time the user chooses an image in the fire system.
     * The event is fired by the input file field in the form
     */
    function handleImageChange(event) {
        const file = event.target.files[0];
        if (file.size < 500000) {
            // image file size must be below 0,5MB
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = event => {
                setImage(event.target.result);
            };
            reader.readAsDataURL(file);
            setErrorMessage(""); // reset errorMessage state
        } else {
            // if not below 0.5MB display an error message using the errorMessage state
            setErrorMessage("The image file must be below 0,5 MB");
        }
    }
    async function uploadImage() {
        //url to new image. "race-rest" must be replaced with own firebase project id
        const url = `https://firebasestorage.googleapis.com/v0/b/race-rest.appspot.com/o/${imageFile.name}`;
        // POST request to upload image
        const response = await fetch(url, {
            method: "POST",
            body: imageFile,
            headers: { "Content-Type": imageFile.type }
        });
        const data = await response.json();
        console.log(data); // data response from image upload
        const imageUrl = `${url}?alt=media`;
        return imageUrl;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        const imageUrl = await uploadImage();
        const formData = {
            // create a new objebt to store the value from states / input fields
            // using "imageUrl" pointing to uploaded image file instead of "image" state
            title: title,
            image: imageUrl,
            body: body
        };

        const validForm = formData.title && formData.body && formData.image; // will return false if one of the properties doesn't have a value
        if (validForm) {
            // if all fields/ properties are filled, then call savePost
            savePost(formData);
        } else {
            // if not, set errorMessage state.
            setErrorMessage("Please, fill in all fields.");
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Title
                <input
                    type="text"
                    value={title}
                    placeholder="Type a title"
                    onChange={e => setTitle(e.target.value)}
                />
            </label>
            <label>
                Body
                <input
                    type="text"
                    value={body}
                    placeholder="Type a body text"
                    onChange={e => setBody(e.target.value)}
                />
            </label>
            <label>
                Image
                <input
                    type="file"
                    className="file-input"
                    accept="image/*"
                    onChange={handleImageChange}
                />
                <img
                    className="image-preview"
                    src={image}
                    alt="Choose"
                    onError={event => (event.target.src = imgPlaceholder)}
                />
            </label>
            <p className="text-error">{errorMessage}</p>
            <button type="submit">Save</button>
        </form>
    );
}
