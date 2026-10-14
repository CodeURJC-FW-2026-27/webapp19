# webapp19
# Housing Rental Web

## Team Members

| Name | Surname | Official University Email | GitHub Account |
| :--- | :--- | :--- | :--- |
| Paula | Sánchez Garduño | p.sanchezg.2023@alumnos.urjc.es | paulasanchez4 |
| Diego | Rodríguez Salinas| d.rodriguezs.2023@alumnos.urjc.es | diieegorodriguezz |
| Rodrigo | Fernández de Córdoba García | r.fernandezgar.2023@alumnos.urjc.es | RodrigoFDCG |
| Enrique | Aldama Moradillo | e.aldama.2023@alumnos.urjc.es | EnriqueAldama |

* **Trello Board / Coordination Tool:** https://trello.com/b/ERNrTVPC/housing-rental-web

---

## Functionality

### Entities

* **Main Entity: Property**
  * Description: Represents a real estate property (apartment or house) available for rent, displaying its main details.
  * Attributes:
    * `title` (String): Title of the property listing (must start with an uppercase letter and be unique).
    * `price` (Number): Price in euros (rent per month).
    * `location` (String): City or neighborhood where the property is located.
    * `description` (String): Detailed description of the property features.
    * `rooms` (Number): Number of bedrooms in the property.
    * `area` (Number): Total area of the property in square meters.

* **Secondary Entity: Review**
  * Description: Represents comments, ratings, and feedback left by users regarding a specific property.
  * Attributes:
    * `author` (String): Name or username of the person writing the review.
    * `rating` (Number): Score given to the property (e.g., from 1 to 5 stars).
    * `comment` (String): Detailed text opinion or feedback about the property.
    * `date` (String): Date when the review was posted.

### Images

* Each **Property** entity will have one or more associated images (photographs of the apartment or house) uploaded directly from the web browser.
* **Review** entities focus primarily on text comments and ratings.

### Search, Filtering, and Categorization
* **Search Engine**: A text input box allowing users to search for properties whose title or location contains the specified query string.
* **Categorization:** Properties are categorized by price ranges, location zones, or the number of rooms, accessible from the navigation menu. 

## Member participation

### Participation of Paula Sánchez Garduño

**Description of tasks performed:**

* For this initial task, I was responsible for establishing the entire structural and visual foundation of the web application using HTML and CSS. I began by defining the semantic structure of the main page and setting up the basic navigation bar. Next, I downloaded and adapted a Bootstrap template, integrating its grid system to ensure a responsive design. Once that foundation was in place, I populated the catalog by adding details for eight of the nine required properties, thereby completing the home page. I also worked on the individual property pages, structuring the section dedicated to the secondary entity. Finally, I finished the property creation form by standardizing the header and including the category selector, thus meeting one of the key requirements.

**The 5 most significant commits:**
* [Setup semantic HTML structure and navigation for index page](https://github.com/CodeURJC-FW-2026-27/webapp19/commit/b4e3e33dd107cfdf9caefb967acce4816412545b): I’ve prepared the HTML "skeleton" and the navigation here before applying the styles.
* [Integrate Bootstrap template and layout into index.html](https://github.com/CodeURJC-FW-2026-27/webapp19/commit/eae3f26d54dc9476fe79eb575a57174cf4a32601): 
That was where I integrated the Bootstrap template into the project to start shaping the interface.
* [Add secondary entity to property_detail.html](https://github.com/CodeURJC-FW-2026-27/webapp19/commit/0a8c3330dd87e319943f295cad0ec7e5f9f72f5e): 
In this commit, I defined the view for the secondary entity within the property details.
* [Add complete details for remaining 8 properties](https://github.com/CodeURJC-FW-2026-27/webapp19/commit/4ee713b57385a37e9dd76bb17a2d5b238429d772)
Complete the cover page to finalize the grid with all the test elements.
* [Add category select form field and fix navbar active link](https://github.com/CodeURJC-FW-2026-27/webapp19/commit/30a16aa947d57ad14f0dba4b72e926aa0ed230b4)
Where I added the dropdown menu to the form to categorize the properties.

**The 5 files I have contributed to the most:**
* [`index.html`](https://github.com/CodeURJC-FW-2026-27/webapp19/blob/main/index.html): 
Where I set up the semantic HTML and the Bootstrap template, and filled in the cover page properties.
* [`property_detail.html`](https://github.com/CodeURJC-FW-2026-27/webapp19/blob/main/property_detail.html)
Where I set up the individual view and added the secondary entity block.
* [`new_property.html`](https://github.com/CodeURJC-FW-2026-27/webapp19/blob/main/new_property.html)
Where I adjusted the form by adding the category selector and unified the menu.
* [`style.css`](https://github.com/CodeURJC-FW-2026-27/webapp19/blob/main/css/styles.css)
For the additional style adjustments I had to make to the template.
* [`README.md`](https://github.com/CodeURJC-FW-2026-27/webapp19/blob/main/README.md)
Where I added the initial configuration and the link to Trello, and documented my part of the work.

### Participation of Diego Rodríguez Salinas

**Description of tasks performed:**

* For this part of the project, I updated the documentation to include the `rooms` and `area` attributes of the `Property` entity and added the number of rooms as a categorization option. I also populated the home page with sample property names. Finally, I created the property creation page and its form, including fields for the title, price, location, description, number of rooms, area, and image, as well as Save and Cancel actions.

**The most significant commits:**

* [Entities update](https://github.com/CodeURJC-FW-2026-27/webapp19/commit/39266c9a76e7df633f2bed9a2c162cf2a6537aa7): In this commit, I added the `rooms` and `area` attributes to the `Property` entity and updated the categorization description to include the number of rooms.
* [Populate main page with sample items](https://github.com/CodeURJC-FW-2026-27/webapp19/commit/1fbd23cb88488cf92e206ca9fc152dcc6603bb6c): In this commit, I replaced the placeholder titles on the nine property cards with sample property names, so the home page displays example listings.
* [Update new_property.html](https://github.com/CodeURJC-FW-2026-27/webapp19/commit/a8c91b5725649ac52e894f128f767f40392a6e90): In this commit, I created the property creation page from scratch. I added the page navigation and heading, then built a responsive Bootstrap form with fields for the title, price, location, description, number of rooms, area, and property image. I also added Save and Cancel actions, with Cancel linking back to the home page.

**The files I have contributed to:**

* [`README.md`](https://github.com/CodeURJC-FW-2026-27/webapp19/blob/main/README.md): Documented the Property attributes and categorization by number of rooms.
* [`index.html`](https://github.com/CodeURJC-FW-2026-27/webapp19/blob/main/index.html): Added sample titles for the property cards on the home page.
* [`new_property.html`](https://github.com/CodeURJC-FW-2026-27/webapp19/blob/main/new_property.html): Created the property form and its page layout.
