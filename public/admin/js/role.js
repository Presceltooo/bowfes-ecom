// Delete Item
const buttonsDelete = document.querySelectorAll("[button-delete]");
if (buttonsDelete.length > 0) {
  const formDeleteItem = document.querySelector("#form-delete-item");
  const path = formDeleteItem.getAttribute("data-path");

  buttonsDelete.forEach(button => {
    button.addEventListener("click", () => {
      const isConfirm = confirm("Bạn chắc chắn muốn xóa nhóm quyền này chứ?");

      if (isConfirm) {
        const id = button.getAttribute("data-id");

        const action = `${path}/${id}?_method=DELETE`;

        formDeleteItem.action = action;
        formDeleteItem.submit();
      }
    });
  });
}
// End Delete Item

// Restore Item
const buttonsRestore = document.querySelectorAll("[button-restore]");
if (buttonsRestore.length > 0) {
  const formRestoreItem = document.querySelector("#form-restore-item");
  const path = formRestoreItem.getAttribute("data-path");

  buttonsRestore.forEach(button => {
    button.addEventListener("click", () => {
      const isConfirm = confirm("Bạn chắc chắn muốn khôi phục nhóm quyền này chứ?");

      if (isConfirm) {
        const id = button.getAttribute("data-id");

        const action = `${path}/${id}?_method=PATCH`;

        formRestoreItem.action = action;
        formRestoreItem.submit();
      }
    });
  });
}
// End Restore Item