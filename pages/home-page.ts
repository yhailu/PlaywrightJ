import { expect, Locator, Page } from "@playwright/test";

export class AmazonHomePage {
    readonly page: Page;
    readonly searchBar: Locator;
    readonly searchBarButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.searchBar = page.locator('id=twotabsearchtextbox');
        this.searchBarButton = page.locator('id=nav-search-submit-button');
    }

    async navigate() {
        await this.page.goto('https://www.amazon.com')
    }

    async typeAndSearch(searchCritera) {
        await this.searchBar.fill(searchCritera);
        await this.searchBarButton.click();
    }
}