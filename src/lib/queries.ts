// Una instantánea coherente: solo documentos publicados, resueltos en build.
export const restaurantQuery = `{
 "settings": *[_type == "settings" && _id == "restaurant-settings"][0]{name,tagline,concept,address,email,phone,isFictional,reservationUrl,hours[]{days,time}},
 "pages": *[_type == "page"] | order(slug.current asc){"slug":slug.current,eyebrow,title,intro,"image":image{"url":asset->url,alt},seo{title,description,"image":image{"url":asset->url,alt}}},
 "categories": *[_type == "category"] | order(order asc, name asc){_id,name,note},
 "dishes": *[_type == "dish"] | order(order asc, name asc){_id,name,description,price,"categoryId":category._ref,allergens,available,featured,"image":image{"url":asset->url,alt}},
 "story": *[_type == "story" && _id == "restaurant-story"][0]{title,body,philosophy,chefName,chefBio,"image":image{"url":asset->url,alt}},
 "gallery": coalesce(*[_type == "gallery" && _id == "restaurant-gallery"][0].images[]{"url":asset->url,alt},[])
}`;
