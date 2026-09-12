// Database seed script for the Snitch backend.
//
// Populates the database with two seller accounts, three buyer accounts,
// and ~30 published products (real product photography hotlinked from
// Pexels, a free stock-photo CDN that allows direct hotlinking).
//
// Usage:
//   node src/scripts/seed.js
//
// Safe to re-run: it upserts the seed users by email and replaces only the
// products owned by those two seed sellers, so it won't create duplicates.

import crypto from "crypto"
import bcrypt from "bcryptjs"
import { connectDB } from "../config/db.js"
import userModel from "../models/user.model.js"
import productModel from "../models/product.model.js"
import mongoose from "mongoose"

const SEED_PASSWORD = "Snitch@123"

const SELLERS = [
    { name: "Aditya Malhotra", email: "aditya.seller@snitch.dev", role: "seller" },
    { name: "Kabir Rathore", email: "kabir.seller@snitch.dev", role: "seller" },
]

const BUYERS = [
    { name: "Rohan Verma", email: "rohan.buyer@snitch.dev", role: "user" },
    { name: "Priya Nair", email: "priya.buyer@snitch.dev", role: "user" },
    { name: "Meera Iyer", email: "meera.buyer@snitch.dev", role: "user" },
]

// Small helper to keep product definitions readable below.
function img(id, ext = "jpeg") {
    return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.${ext}?auto=compress&cs=tinysrgb&w=1200`
}

function sizes(pairs) {
    return pairs.map(([ size, stock ]) => ({ size, stock }))
}

// 30 products across 9 categories. Images are real, hotlinkable photos
// from Pexels (images.pexels.com) — a real website whose license permits
// direct hotlinking, so these will actually render once a frontend is built.
const PRODUCTS = [
    // ---- T-Shirts ----
    {
        title: "Men Black Solid Oversized Fit T-Shirt",
        description: "A wardrobe staple cut in a relaxed oversized silhouette from heavyweight cotton. Solid black, minimal branding, built for everyday streetwear layering.",
        price: 799,
        categories: [ "Men", "T-Shirts" ],
        images: [ img(9775889), img(15258903, "png") ],
        sizes: sizes([ [ "S", 18 ], [ "M", 30 ], [ "L", 26 ], [ "XL", 14 ] ]),
    },
    {
        title: "Men White Ribbed Slim Fit T-Shirt",
        description: "Ribbed cotton-stretch tee tailored to a slim fit. Clean white finish that layers easily under shirts and jackets without losing its shape.",
        price: 699,
        categories: [ "Men", "T-Shirts" ],
        images: [ img(3290886), img(7658459) ],
        sizes: sizes([ [ "XS", 8 ], [ "S", 20 ], [ "M", 24 ], [ "L", 16 ] ]),
    },
    {
        title: "Men Olive Green Graphic Print T-Shirt",
        description: "Garment-dyed olive tee finished with a subtle chest print. Soft-hand cotton fabric with a slightly boxy fit for an easy, everyday look.",
        price: 899,
        categories: [ "Men", "T-Shirts" ],
        images: [ img(36942017), img(17273952) ],
        sizes: sizes([ [ "S", 15 ], [ "M", 22 ], [ "L", 20 ], [ "XL", 10 ] ]),
    },
    {
        title: "Men Charcoal Grey Henley T-Shirt",
        description: "Three-button henley in a heathered charcoal knit. A dressed-up alternative to the crew neck, equally at home solo or under a jacket.",
        price: 849,
        categories: [ "Men", "T-Shirts" ],
        images: [ img(12781928), img(19101328) ],
        sizes: sizes([ [ "S", 12 ], [ "M", 18 ], [ "L", 18 ], [ "XL", 9 ] ]),
    },

    // ---- Shirts ----
    {
        title: "Men Navy Blue Checked Slim Fit Shirt",
        description: "Slim fit shirt in a fine navy check, woven from breathable cotton. Spread collar and a tapered body make it equally suited to desk and dinner.",
        price: 1299,
        categories: [ "Men", "Shirts" ],
        images: [ img(19852754), img(2421356) ],
        sizes: sizes([ [ "S", 14 ], [ "M", 24 ], [ "L", 20 ], [ "XL", 10 ] ]),
    },
    {
        title: "Men White Solid Formal Shirt",
        description: "Crisp white formal shirt in a smooth cotton blend that resists creasing through a long day. A sharp, no-fuss essential for the office.",
        price: 1199,
        categories: [ "Men", "Shirts" ],
        images: [ img(31618286), img(17890975) ],
        sizes: sizes([ [ "S", 16 ], [ "M", 26 ], [ "L", 22 ], [ "XL", 12 ] ]),
    },
    {
        title: "Men Beige Linen Casual Shirt",
        description: "Breathable linen-blend shirt in warm beige, cut with a relaxed body and short sleeves for hot-weather comfort without sacrificing style.",
        price: 1499,
        categories: [ "Men", "Shirts" ],
        images: [ img(16062780), img(6616649) ],
        sizes: sizes([ [ "S", 10 ], [ "M", 18 ], [ "L", 16 ], [ "XL", 8 ] ]),
    },
    {
        title: "Men Black Printed Resort Shirt",
        description: "Short-sleeve resort shirt in an all-over print on a black base. Lightweight viscose fabric drapes well for vacation-ready styling.",
        price: 1399,
        categories: [ "Men", "Shirts" ],
        images: [ img(3214809), img(17960004) ],
        sizes: sizes([ [ "S", 9 ], [ "M", 16 ], [ "L", 14 ], [ "XL", 7 ] ]),
    },

    // ---- Jeans ----
    {
        title: "Men Blue Slim Fit Stretchable Jeans",
        description: "Mid-wash blue jeans in a slim fit with just enough stretch for all-day movement. A five-pocket denim built to be worn on repeat.",
        price: 1799,
        categories: [ "Men", "Jeans" ],
        images: [ img(16069736), img(31988321) ],
        sizes: sizes([ [ "S", 12 ], [ "M", 22 ], [ "L", 20 ], [ "XL", 10 ] ]),
    },
    {
        title: "Men Black Tapered Fit Jeans",
        description: "Deep black denim with a tapered leg that narrows toward the ankle. Clean, unfaded finish for a sharper, more versatile look.",
        price: 1899,
        categories: [ "Men", "Jeans" ],
        images: [ img(4258605), img(28938765) ],
        sizes: sizes([ [ "S", 10 ], [ "M", 20 ], [ "L", 18 ], [ "XL", 9 ] ]),
    },
    {
        title: "Men Light Wash Straight Fit Jeans",
        description: "Light-wash straight fit jeans with a classic five-pocket cut. Sturdy cotton denim that softens with wear while holding its shape.",
        price: 1699,
        categories: [ "Men", "Jeans" ],
        images: [ img(18139574), img(10004179) ],
        sizes: sizes([ [ "S", 11 ], [ "M", 19 ], [ "L", 17 ], [ "XL", 8 ] ]),
    },

    // ---- Hoodies ----
    {
        title: "Men Black Solid Pullover Hoodie",
        description: "Brushed-fleece pullover hoodie in solid black with a kangaroo pocket and adjustable drawcord hood. Warm, boxy, and built to layer.",
        price: 1599,
        categories: [ "Men", "Hoodies" ],
        images: [ img(5840463), img(8346261) ],
        sizes: sizes([ [ "S", 14 ], [ "M", 24 ], [ "L", 22 ], [ "XL", 12 ] ]),
    },
    {
        title: "Men Grey Melange Oversized Hoodie",
        description: "Oversized hoodie in a soft grey melange fleece. Dropped shoulders and a relaxed body give it an easy, streetwear-first silhouette.",
        price: 1699,
        categories: [ "Men", "Hoodies" ],
        images: [ img(14241847), img(19461563) ],
        sizes: sizes([ [ "S", 10 ], [ "M", 20 ], [ "L", 18 ], [ "XL", 9 ] ]),
    },
    {
        title: "Men Maroon Fleece Zipper Hoodie",
        description: "Full-zip fleece hoodie in a rich maroon shade, with ribbed cuffs and hem for a snug fit. A reliable throw-on for cooler evenings.",
        price: 1799,
        categories: [ "Men", "Hoodies" ],
        images: [ img(2314992), img(31052880) ],
        sizes: sizes([ [ "S", 9 ], [ "M", 17 ], [ "L", 15 ], [ "XL", 7 ] ]),
    },

    // ---- Jackets ----
    {
        title: "Men Black Faux Leather Biker Jacket",
        description: "Classic biker jacket in supple faux leather with asymmetric zip closure and quilted shoulder panels. A statement outer layer for cold nights.",
        price: 2999,
        categories: [ "Men", "Jackets" ],
        images: [ img(15180569), img(31696292) ],
        sizes: sizes([ [ "S", 6 ], [ "M", 12 ], [ "L", 10 ], [ "XL", 5 ] ]),
    },
    {
        title: "Men Olive Bomber Jacket",
        description: "Lightweight bomber jacket in olive with ribbed collar, cuffs, and hem. Zippered pockets and a boxy fit make it an easy year-round layer.",
        price: 2499,
        categories: [ "Men", "Jackets" ],
        images: [ img(13030489), img(6461703) ],
        sizes: sizes([ [ "S", 8 ], [ "M", 14 ], [ "L", 12 ], [ "XL", 6 ] ]),
    },
    {
        title: "Men Denim Trucker Jacket",
        description: "Timeless trucker jacket in mid-wash denim with a button front and chest flap pockets. Pairs equally well over tees or hoodies.",
        price: 2199,
        categories: [ "Men", "Jackets" ],
        images: [ img(18633077), img(1833077) ],
        sizes: sizes([ [ "S", 7 ], [ "M", 13 ], [ "L", 11 ], [ "XL", 5 ] ]),
    },
    {
        title: "Men Navy Quilted Puffer Jacket",
        description: "Insulated puffer jacket in navy with a diamond-quilted finish and a zip-through front. Packable warmth for the coldest months.",
        price: 2899,
        categories: [ "Men", "Jackets" ],
        images: [ img(16604298), img(14707868) ],
        sizes: sizes([ [ "S", 6 ], [ "M", 11 ], [ "L", 10 ], [ "XL", 4 ] ]),
    },

    // ---- Joggers ----
    {
        title: "Men Black Slim Fit Joggers",
        description: "Slim fit joggers in soft black fleece with an elasticated, drawcord waistband and tapered ankle cuffs. Built for lounging or the gym.",
        price: 1099,
        categories: [ "Men", "Joggers" ],
        images: [ img(5696896), img(12738118) ],
        sizes: sizes([ [ "S", 15 ], [ "M", 26 ], [ "L", 22 ], [ "XL", 12 ] ]),
    },
    {
        title: "Men Grey Melange Track Pants",
        description: "Everyday track pants in grey melange cotton, with side taping and zip pockets. A comfortable, breathable fit for training or travel.",
        price: 999,
        categories: [ "Men", "Joggers" ],
        images: [ img(15868727), img(30695286) ],
        sizes: sizes([ [ "S", 13 ], [ "M", 22 ], [ "L", 19 ], [ "XL", 10 ] ]),
    },
    {
        title: "Men Olive Cargo Joggers",
        description: "Cargo-style joggers in olive twill with utility pockets down each leg and a tapered, drawcord hem. Streetwear function meets comfort.",
        price: 1299,
        categories: [ "Men", "Joggers" ],
        images: [ img(12738124), img(9499128) ],
        sizes: sizes([ [ "S", 10 ], [ "M", 18 ], [ "L", 16 ], [ "XL", 8 ] ]),
    },

    // ---- Shorts ----
    {
        title: "Men Navy Blue Cotton Shorts",
        description: "Above-the-knee cotton shorts in navy with a comfortable elasticated waist. A warm-weather essential that pairs with almost anything.",
        price: 799,
        categories: [ "Men", "Shorts" ],
        images: [ img(12803209), img(18178103) ],
        sizes: sizes([ [ "S", 14 ], [ "M", 22 ], [ "L", 18 ], [ "XL", 9 ] ]),
    },
    {
        title: "Men Black Solid Sports Shorts",
        description: "Lightweight sports shorts in quick-dry fabric with a mesh-lined interior and side pockets. Built for training sessions and beyond.",
        price: 749,
        categories: [ "Men", "Shorts" ],
        images: [ img(28038671), img(19040502) ],
        sizes: sizes([ [ "S", 16 ], [ "M", 24 ], [ "L", 20 ], [ "XL", 11 ] ]),
    },
    {
        title: "Men Beige Cargo Shorts",
        description: "Utility cargo shorts in beige cotton twill with multiple pockets and an adjustable waist tab. Rugged, functional, and easy to style.",
        price: 899,
        categories: [ "Men", "Shorts" ],
        images: [ img(9775877), img(18178451) ],
        sizes: sizes([ [ "S", 9 ], [ "M", 17 ], [ "L", 14 ], [ "XL", 6 ] ]),
    },

    // ---- Sweatshirts ----
    {
        title: "Men Red Solid Crew Neck Sweatshirt",
        description: "Crew neck sweatshirt in bold red fleece with ribbed cuffs and hem. A simple, warm layer that works as well solo as it does underneath a jacket.",
        price: 1399,
        categories: [ "Men", "Sweatshirts" ],
        images: [ img(2244954), img(842944) ],
        sizes: sizes([ [ "S", 12 ], [ "M", 20 ], [ "L", 18 ], [ "XL", 9 ] ]),
    },
    {
        title: "Men Grey Oversized Sweatshirt",
        description: "Oversized crew sweatshirt in heather grey fleece, with dropped shoulders and a relaxed drape for a laid-back, streetwear-ready fit.",
        price: 1499,
        categories: [ "Men", "Sweatshirts" ],
        images: [ img(10034620), img(19880432) ],
        sizes: sizes([ [ "S", 10 ], [ "M", 18 ], [ "L", 16 ], [ "XL", 8 ] ]),
    },
    {
        title: "Men Yellow Colourblock Sweatshirt",
        description: "Colourblocked sweatshirt in yellow and charcoal panels, cut from soft brushed fleece. A bright, easy layer for cooler days.",
        price: 1349,
        categories: [ "Men", "Sweatshirts" ],
        images: [ img(907916), img(19880447) ],
        sizes: sizes([ [ "S", 8 ], [ "M", 15 ], [ "L", 13 ], [ "XL", 6 ] ]),
    },

    // ---- Polo Shirts ----
    {
        title: "Men White Pique Polo T-Shirt",
        description: "Classic pique-knit polo in crisp white with a ribbed collar and two-button placket. A timeless smart-casual essential.",
        price: 999,
        categories: [ "Men", "Polo Shirts" ],
        images: [ img(8068701), img(34894401) ],
        sizes: sizes([ [ "S", 14 ], [ "M", 24 ], [ "L", 20 ], [ "XL", 10 ] ]),
    },
    {
        title: "Men Navy Striped Polo Shirt",
        description: "Striped pique polo in navy and white, tailored to a regular fit. A versatile piece that moves easily from weekday to weekend.",
        price: 1099,
        categories: [ "Men", "Polo Shirts" ],
        images: [ img(17987935), img(9301162) ],
        sizes: sizes([ [ "S", 11 ], [ "M", 19 ], [ "L", 17 ], [ "XL", 8 ] ]),
    },
    {
        title: "Men Black Solid Polo T-Shirt",
        description: "Solid black polo in breathable cotton pique with a clean ribbed collar. A sharp, minimal staple for everyday wear.",
        price: 949,
        categories: [ "Men", "Polo Shirts" ],
        images: [ img(24446647), img(17987934) ],
        sizes: sizes([ [ "S", 13 ], [ "M", 21 ], [ "L", 18 ], [ "XL", 9 ] ]),
    },
]

async function upsertUser({ name, email, role }) {
    const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10)
    const user = await userModel.findOneAndUpdate(
        { email },
        { $set: { name, email, passwordHash, role } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    return user
}

function toImageDocs(urls) {
    return urls.map((url, index) => ({
        imagekitId: crypto.randomBytes(12).toString("hex"),
        url,
        order: index + 1,
    }))
}

async function main() {
    console.log("Connecting to MongoDB...")
    await connectDB()

    console.log("Seeding users...")
    const sellers = []
    for (const s of SELLERS) sellers.push(await upsertUser(s))
    const buyers = []
    for (const b of BUYERS) buyers.push(await upsertUser(b))

    const sellerIds = sellers.map((s) => s._id)

    console.log("Clearing previously seeded products for these sellers...")
    await productModel.deleteMany({ seller: { $in: sellerIds } })

    console.log(`Inserting ${PRODUCTS.length} products...`)
    const docs = PRODUCTS.map((p, index) => ({
        title: p.title,
        description: p.description,
        price: { amount: p.price, currency: "INR" },
        categories: p.categories,
        images: toImageDocs(p.images),
        seller: sellerIds[ index % sellerIds.length ],
        sizes: p.sizes,
        isPublished: true,
    }))

    const inserted = await productModel.insertMany(docs)

    console.log("\n=== Seed complete ===")
    console.log(`Sellers (password: ${SEED_PASSWORD}):`)
    sellers.forEach((s) => console.log(`  - ${s.name} <${s.email}> id=${s._id}`))
    console.log(`Buyers (password: ${SEED_PASSWORD}):`)
    buyers.forEach((b) => console.log(`  - ${b.name} <${b.email}> id=${b._id}`))
    console.log(`Products inserted: ${inserted.length}`)

    await mongoose.disconnect()
    process.exit(0)
}

main().catch((err) => {
    console.error("Seed failed:", err)
    process.exit(1)
})
