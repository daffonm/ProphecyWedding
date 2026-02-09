export function ReviewCard({coupleName, review, rating = 5}) {
    const stars = []
    for (let i = 0; i < rating; i++) {
        stars.push("/icons/icons8-star-50.png")
    }
  
    return (
        <div className="bd-4 bg-white flex flex-col items-center  gap-4 py-10 px-8 rounded-2xl relative">

            <div className="absolute top-0 -translate-y-6 flex flex-row justify-center">
                <img src="icons/icons8-profile-30.png" className="w-15 h-15 translate-x-2.5" alt=""/>
                <img src="icons/icons8-profile-30.png" className="w-15 h-15 -translate-x-2.5" alt=""/>
            </div>

            <h2 className="text-xl">{coupleName}</h2>
            <p className="text-center">{review}</p>
            <div className="flex flex-row justify-center mt-4">
                {stars.map((star, index) => <img className="w-5 h-5" key={index} src={star} alt="star" />)}
            </div>
        </div>
    )
}

export default function ClientReviewSection() {
    return (
        <section className="-translate-y-25 px-6 flex flex-col gap-16">

            <div className="flex flex-row gap-6">
                <ReviewCard 
                coupleName="Danu & Imeld" 
                review="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                rating={3}
                />
                <ReviewCard 
                coupleName="Danu & Imeld" 
                review="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                rating={1}
                />
                <ReviewCard 
                coupleName="Danu & Imeld" 
                review="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                rating={5}
                />
            </div>
            <h1 className="text-5xl text-end pr-14">Couple's Testimonials</h1>
        </section>
    )
}