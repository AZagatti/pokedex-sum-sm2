import { expect, test } from "@playwright/test";

test.describe("Pokédex list", () => {
  test("loads the list and shows Pokémon cards", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Bulbasaur" })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Ivysaur/u })).toBeVisible();
  });

  test("search filters the visible cards", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("searchbox", { name: "Search Pokémon by name" })
      .fill("pikachu");
    await expect(
      page.getByRole("heading", { exact: true, name: "Pikachu" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Bulbasaur" })
    ).not.toBeVisible();
  });

  test("clicking a card navigates to the detail page", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /Charizard/u })
      .first()
      .click();
    await expect(page).toHaveURL(/\/pokemon\/charizard/u);
    await expect(
      page.getByRole("heading", { level: 1, name: "Charizard" })
    ).toBeVisible();
  });

  test("toggling a favorite persists to the favorites page", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("button", { name: "Add Bulbasaur to favorites" })
      .click();
    await page.goto("/favorites");
    await expect(
      page.getByRole("heading", { name: "Bulbasaur" })
    ).toBeVisible();
  });

  test("theme toggle switches and persists across reload", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });
});

test.describe("Berries", () => {
  test("lists berries and navigates to a detail page", async ({ page }) => {
    await page.goto("/berries");
    await expect(page.getByRole("heading", { name: "Cheri" })).toBeVisible();
    await page.getByRole("link", { name: /Cheri/u }).click();
    await expect(page).toHaveURL(/\/berries\/cheri/u);
    await expect(page.getByText("Firmness")).toBeVisible();
  });
});

test.describe("404", () => {
  test("shows a not-found page for an unknown Pokémon", async ({ page }) => {
    await page.route(
      "https://pokeapi.co/api/v2/pokemon/not-a-real-pokemon",
      (route) => route.fulfill({ body: "{}", status: 404 })
    );
    await page.goto("/pokemon/not-a-real-pokemon");
    await expect(
      page.getByRole("heading", { name: "Pokémon not found" })
    ).toBeVisible();
  });
});
