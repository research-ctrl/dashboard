import type { ChapterMeta } from "@/data/types";
import { goa } from "@/data/chapters/goa";
import { portugal } from "@/data/chapters/portugal";

/** Left, right — reorder here to swap the chapters across the screen. */
export const chapters: ChapterMeta[] = [goa, portugal];
