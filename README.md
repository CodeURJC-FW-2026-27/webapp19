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
