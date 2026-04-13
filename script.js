const recipeForm = document.querySelector("#recipe-form");
const recipeNameInput = document.querySelector("#recipe-name");
const recipeIngredientsInput = document.querySelector("#recipe-ingredients");
const recipeList = document.querySelector("#recipe-list");
const recipeCount = document.querySelector("#recipe-count");
const weekMenu = document.querySelector("#week-menu");
const makeMenuButton = document.querySelector("#make-menu-button");
const storageKey = "week-menu-maker-recipes";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const starterRecipes = [
  {
    id: crypto.randomUUID(),
    name: "Lemon Chicken Tray Bake",
    ingredients: ["Chicken", "Potatoes", "Lemon", "Garlic", "Rosemary"],
  },
  {
    id: crypto.randomUUID(),
    name: "Veggie Stir-Fry",
    ingredients: ["Noodles", "Bell pepper", "Broccoli", "Soy sauce", "Ginger"],
  },
  {
    id: crypto.randomUUID(),
    name: "Creamy Tomato Pasta",
    ingredients: ["Pasta", "Tomatoes", "Cream", "Parmesan", "Basil"],
  },
];

let recipes = loadRecipes();

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function loadRecipes() {
  const savedRecipes = localStorage.getItem(storageKey);

  if (!savedRecipes) {
    return starterRecipes;
  }

  try {
    const parsedRecipes = JSON.parse(savedRecipes);

    if (!Array.isArray(parsedRecipes)) {
      return starterRecipes;
    }

    return parsedRecipes.filter((recipe) => {
      return (
        recipe &&
        typeof recipe.id === "string" &&
        typeof recipe.name === "string" &&
        Array.isArray(recipe.ingredients)
      );
    });
  } catch {
    return starterRecipes;
  }
}

function saveRecipes() {
  localStorage.setItem(storageKey, JSON.stringify(recipes));
}

function parseIngredients(rawIngredients) {
  return rawIngredients
    .split(/\n|,/)
    .map((ingredient) => ingredient.trim())
    .filter(Boolean);
}

function shuffleRecipes(recipeArray) {
  const shuffled = [...recipeArray];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function updateRecipeCount() {
  recipeCount.textContent = `${recipes.length} recipe${recipes.length === 1 ? "" : "s"}`;
}

function renderRecipes() {
  if (recipes.length === 0) {
    recipeList.innerHTML =
      '<p class="empty-state">No recipes yet. Add your first one above.</p>';
    updateRecipeCount();
    return;
  }

  recipeList.innerHTML = recipes
    .map(
      (recipe) => `
        <article class="recipe-card">
          <div class="recipe-card-header">
            <div>
              <h4>${escapeHtml(recipe.name)}</h4>
            </div>
            <button
              class="ghost-button"
              type="button"
              data-remove-id="${recipe.id}"
            >
              Remove
            </button>
          </div>
          <ul class="ingredient-list">
            ${recipe.ingredients.map((ingredient) => `<li>${escapeHtml(ingredient)}</li>`).join("")}
          </ul>
        </article>
      `
    )
    .join("");

  updateRecipeCount();
}

function renderWeekMenu(menuRecipes) {
  weekMenu.innerHTML = menuRecipes
    .map(
      (recipe, index) => `
        <article class="day-card">
          <div class="day-card-header">
            <div>
              <div class="day-label">${daysOfWeek[index]}</div>
              <h4>${escapeHtml(recipe.name)}</h4>
            </div>
          </div>
          <p>${recipe.ingredients.map(escapeHtml).join(", ")}</p>
        </article>
      `
    )
    .join("");
}

function buildWeekMenu() {
  if (recipes.length === 0) {
    weekMenu.innerHTML =
      '<p class="empty-state">Please add at least one recipe before making a week menu.</p>';
    return;
  }

  const shuffledRecipes = shuffleRecipes(recipes);
  const menuRecipes = daysOfWeek.map((_, index) => {
    return shuffledRecipes[index % shuffledRecipes.length];
  });

  renderWeekMenu(menuRecipes);
}

recipeForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = recipeNameInput.value.trim();
  const ingredients = parseIngredients(recipeIngredientsInput.value);

  if (!name || ingredients.length === 0) {
    return;
  }

  recipes = [
    {
      id: crypto.randomUUID(),
      name,
      ingredients,
    },
    ...recipes,
  ];

  saveRecipes();
  renderRecipes();
  recipeForm.reset();
  recipeNameInput.focus();
});

recipeList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-id]");

  if (!button) {
    return;
  }

  const { removeId } = button.dataset;
  recipes = recipes.filter((recipe) => recipe.id !== removeId);
  saveRecipes();
  renderRecipes();
});

makeMenuButton.addEventListener("click", buildWeekMenu);

renderRecipes();
buildWeekMenu();
