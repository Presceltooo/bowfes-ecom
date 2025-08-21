const ProductCategory = require("../models/product-category.model");

module.exports.getSubCategory = async (parentId) => {
  const getCategory = async (parentId) => {
    const subs = await ProductCategory.find({
      parent_id: parentId,
      status: "active",
      deleted: false
    });

    let allSub = [...subs];
    // [...subs] sẽ tạo ra 1 mảng mới từ mảng cũ

    for (const sub of subs) {
      const childs = await getCategory(sub.id);
      allSub = allSub.concat(childs);
      // concat() sẽ nối 2 mảng lại với nhau
    }
    return allSub;
  }

  const result = await getCategory(parentId);
  return result;
}