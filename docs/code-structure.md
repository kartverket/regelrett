# Structure of the backend

The backend is structured in a way that is meant to be easy to navigate and understand. The backend is divided into
several packages, each containing a specific type of piece of code. For example, one for code that define endpoints,
one for code that interacts with the database, and that defines the data models. The goals is to separate the concerns
of the application, and make it easy to find the code that you are looking for.

## Database

We use a database to store user data and other resources that the backend makes available. The database package contains
the code that is responsible for interacting with the database. Hopefully, most of the database interaction is done
through the services, which are responsible for performing business logic and fetching data from the database.

## Model

The model package contains the data models that are used throughout the application. The data models are meant to
represent the resources that the backend makes available as well as the data that is fetched from external sources. All
the external data models should have methods for mapping the external data into the internal data model.

## Routes

The routes are defined in the `no.bekk.routes` package. The routes are responsible for defining the endpoints of the
backend. Generally they define the path, the HTTP method and the appropriate controller method to call. The routes are
generally separated into their own files defined by the top level path segment, that should encapsulate one specific
type of resources that are the backend makes available. Their purpose is to extract the parameters from the request and
call the appropriate controller method with those parameters.

## Controllers

The controllers are the entry point of the backend. They are responsible for handling incoming requests and returning
responses. The controllers are located in the `no.bekk.controllers` package. Controllers are meant to be the glue between
the endpoints defined in the routes and the rest of the application. They can be seen as the orchestrators of the
backend, as they determine what services are necessary to get the resource that is requested, and how to return it to
the client.

Hopefully, most of the logic in the controllers is delegated to the services, which performs business logic and fetches
from the database or external sources. The controllers should be kept as thin as possible, and should only be responsible
for handling the request and response, and delegating the actual work to the services.

## Services

The services are responsible for performing business logic and fetching data from the database or external sources by
using clients. The services are supposed to perform the logic of the application, and should be designed such that they
are easy to call from the controllers, and that they return the data in a format that fits the resource the client is
expecting.

## Clients

The clients are responsible for fetching data from external sources. The clients are generally separated by the type of
data they are fetching, and are responsible for making the actual requests to the external sources. They should be
designed such that its methods are easy to call from the services, and that they return the data in a format that is
easy to work with, while keeping the configuration of the external data source separate from the rest of the application.

## An example of how to find what you are looking for

Let's say that we want to fetch a table by its id. We know that the table is a resource that the backend makes available,
so we start by looking in the `no.bekk.routes` package. We find a file called `TableRouting.kt` and open it. Here
we find all the endpoints that are related to tables. We see that there is a route defined for fetching a table by its
id. The route is defined as a GET request to the path `/tables/{id}`, which extracts the id from the path as well as
any potential team that can be defined as a query parameter, and calls the `TableController.getTable` method with the
those parameters as arguments.

We then go the the `TableController` file, and observe that the getTable method does some internal mapping to determine
where to fetch the data from. In our case, it has determined that the particular table is supposed to be fetched from
AirTable, and therefore has to invoke the `AirTableService` to fetch the data.

The `AirTableService` class uses the `AirTableClient` to make the actual request to the AirTable API, and maps the data
into the applications internal data model before it returns the response to the controller,
which then returns the response to the client. As we can see we have a clear separation of concerns, where the routes
are responsible for defining the endpoints, the controllers are responsible for handling the requests and responses, and
the services are responsible for perform logic and using a client for fetching the data from external sources.

