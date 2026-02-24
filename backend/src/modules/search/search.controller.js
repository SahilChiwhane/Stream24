import * as searchService from "./search.service.js";

export const multiSearch = async (req, res, next) => {
  try {
    const { query, page } = req.query;
    
    if (!query) {
      return res.status(400).json({ success: false, message: "Query is required" });
    }

    const data = await searchService.searchMulti(query, page);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
