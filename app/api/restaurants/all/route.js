import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Restaurant from "@/models/Restaurants";

export async function GET() {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ restaurants: [] }, { status: 200 });
  }

  try {
    await dbConnect();
    const restaurants = await Restaurant.find({})
      .select('restaurantName cuisineType location description openingHours images')
      .lean();

    return NextResponse.json({ restaurants }, { status: 200 });
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
} 
