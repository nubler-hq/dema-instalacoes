# 04 - API Schema (Models and Endpoints)

This document defines the data structure (schema) for the API to be developed with Igniter.js. These models will serve as the foundation for the database and the creation of CRUD endpoints.

The API will follow RESTful standards, with endpoints grouped by resource.

**Base URL:** `/api/v1`

---

## 1. `Project` Model

Represents a project or work completed by the company. This will be the main content of the portfolio.

### Model Fields

| Field            | Data Type                                   | Description                                             | Notes                     |
| :--------------- | :------------------------------------------ | :------------------------------------------------------ | :------------------------ |
| `id`             | `string` (UUID)                             | Unique identifier for the project (Primary Key).        | Auto-generated.           |
| `title`          | `string`                                    | The title of the project. Ex: "GR Living Design VL. Madalena". | Required.                 |
| `description`    | `string` (Text)                             | A detailed description of the project's scope.          | Optional.                 |
| `coverImageUrl`  | `string` (URL)                              | The URL for the cover image shown in listings.          | Required.                 |
| `completionDate` | `Date`                                      | The project's completion date.                          | Required.                 |
| `category`       | `enum` (`RESIDENTIAL`, `COMMERCIAL`, `INDUSTRIAL`) | The project category to allow for filtering.            | Required.                 |
| `clientId`       | `string` (UUID)                             | Foreign key to the `Client` model.                      | Optional.                 |
| `galleryImages`  | `Array<GalleryImage>`                       | A one-to-many relationship with gallery images.         | Relation.                 |
| `createdAt`      | `DateTime`                                  | Record creation timestamp.                              | Auto-generated.           |
| `updatedAt`      | `DateTime`                                  | Record last update timestamp.                           | Auto-generated on update. |

### CRUD Endpoints (`/projects`)

-   `GET /projects`: Lists all projects (with pagination and category filtering).
-   `GET /projects/:id`: Retrieves a specific project, including its gallery images.
-   `POST /projects`: Creates a new project.
-   `PUT /projects/:id`: Updates an existing project.
-   `DELETE /projects/:id`: Deletes a project.

---

## 2. `GalleryImage` Model

Represents a single image within a `Project`'s gallery.

### Model Fields

| Field       | Data Type         | Description                                     | Notes                   |
| :---------- | :---------------- | :---------------------------------------------- | :---------------------- |
| `id`        | `string` (UUID)   | Unique identifier for the image (Primary Key).  | Auto-generated.         |
| `url`       | `string` (URL)    | The URL of the image.                           | Required.               |
| `altText`   | `string`          | Alternative text for the image (accessibility). | Optional.               |
| `projectId` | `string` (UUID)   | Foreign key to the `Project` model.             | Required.               |

---

## 3. `Client` Model

Represents a client for whom Dema Instalações has provided services.

### Model Fields

| Field     | Data Type         | Description                                       | Notes                     |
| :-------- | :---------------- | :------------------------------------------------ | :------------------------ |
| `id`      | `string` (UUID)   | Unique identifier for the client (Primary Key).   | Auto-generated.         |
| `name`    | `string`          | The name of the client. Ex: "Marabraz".           | Required.                 |
| `logoUrl` | `string` (URL)    | URL of the client's logo image.                   | Required.                 |
| `segment` | `string`          | The client's industry segment. Ex: "Retail".      | Optional.                 |
| `projects`| `Array<Project>`  | A one-to-many relationship with their projects.   | Relation.                 |

### CRUD Endpoints (`/clients`)

-   `GET /clients`: Lists all clients.
-   `POST /clients`: Adds a new client.
-   `PUT /clients/:id`: Updates a client.
-   `DELETE /clients/:id`: Deletes a client.

---

## 4. `Lead` Model

Represents a contact (lead) generated from the website's contact form.

### Model Fields

| Field     | Data Type                              | Description                                      | Notes                     |
| :-------- | :------------------------------------- | :----------------------------------------------- | :------------------------ |
| `id`      | `string` (UUID)                        | Unique identifier for the lead (Primary Key).    | Auto-generated.         |
| `name`    | `string`                               | Name of the person who made contact.             | Required.                 |
| `email`   | `string`                               | The lead's email address.                        | Required.                 |
| `phone`   | `string`                               | The lead's phone number.                         | Optional.                 |
| `message` | `string` (Text)                        | The message sent by the lead.                    | Required.                 |
| `status`  | `enum` (`NEW`, `CONTACTED`, `ARCHIVED`)  | The lead's status in the service funnel.         | Default: `NEW`.         |
| `createdAt` | `DateTime`                           | Record creation timestamp.                       | Auto-generated.         |

### CRUD Endpoints (`/leads`)

-   `POST /leads`: Creates a new lead (public endpoint).
-   `GET /leads`: Lists all leads (protected/private endpoint).
-   `PUT /leads/:id`: Updates a lead's status (protected/private endpoint).