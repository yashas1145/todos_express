function handleUpdate (todoId) {
    document.getElementById("title" + todoId).setAttribute("hidden", true);
    document.getElementById("update" + todoId).setAttribute("hidden", true);
    document.getElementById("text" + todoId).removeAttribute("hidden");
    document.getElementById("save" + todoId).removeAttribute("hidden");
}