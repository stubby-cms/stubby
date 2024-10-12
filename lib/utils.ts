import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { customAlphabet } from "nanoid";
import slugifyFn from "slugify";

const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
const nanoid = customAlphabet(alphabet, 7);

export function getId(n: number = 7) {
  return nanoid(n);
}

export const absoluteUrl = (url: string) => {
  return `${process.env.NEXT_PUBLIC_HOST}${url}`;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function fetcher<JSON = any>(
  input: string,
  init?: RequestInit,
): Promise<JSON> {
  const response = await fetch(absoluteUrl(input), {
    ...init,
    cache: "no-store",
  });

  if (!response.ok) {
    const error: any = new Error("An error occurred while fetching the data.");
    // Attach extra info to the error object.
    error.info = await response.json();
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export const slugify = (str: string) => {
  return slugifyFn(str, {
    replacement: "-",
    lower: true,
    strict: true,
  });
};

export const isJsonString = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};
