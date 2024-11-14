import { NextResponse } from "next/server";

async function handleTextExtraction(file: File) {
  const text = await file.text();
  return NextResponse.json({ text });
}   