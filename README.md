openapi: 3.0.0
info:
  title: Eventitude API
  description: >-
    The Eventitude API for the 25/26 Full Stack Web Development Assignment.
    For help on getting started, refer to the assignment breif,
    teaching material, or contact Xia.
  contact:
    name: Xia Cui
    email: x.cui@mmu.ac.uk
  version: 1.0.0
servers:
  - url: https://app.swaggerhub.com/apis/XCUI/eventitude-api/1.0.0
    description: SwaggerHub API Auto Mocking
  - url: http://localhost:3333
    description: Run on your local machine
paths:
  /users:
    post:
      tags:
        - User Management
      summary: Create an account for a new user
      description: >-
        Given that the requestBody passes validation checks, and that the user
        name is correct, an account will be created for the new user
      operationId: addUser
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AddUser'
      responses:
        '201':
          description: Created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AddUserResponse'
        '400':
          description: Bad Request
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '500':
          description: Server Error
  /login:
    post:
      tags:
        - User Management
      summary: Log into an account
      description: Will log a user into their account given a valid username and password.
      operationId: loginUser
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginUser'
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/LoginResponse'
        '400':
          description: Bad Request
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '500':
          description: Server Error
  /logout:
    post:
      tags:
        - User Management
      summary: Log out of an account
      description: Will log a user out of their account.
      operationId: logoutUser
      responses:
        '200':
          description: OK
        '401':
          description: Unauthorised
        '500':
          description: Server Error
      security:
        - User: []
  /events:
    post:
      tags:
        - Event management
      summary: Create a new event
      description: >-
        Creates a new event. Start time must be in the future and registration
        must close before the start time.
      operationId: createEvent
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AddEvent'
      responses:
        '201':
          description: Created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AddEventResponse'
        '400':
          description: Bad Request
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: Unauthorised
        '500':
          description: Server Error
      security:
        - User: []
  /event/{event_id}:
    get:
      tags:
        - Event management
      summary: Get a single events details
      description: >-
        Retrieves the details of a single event at a given ID. Note that list of
        attendees will only be visible to the events creator.
      operationId: getEvent
      parameters:
        - name: event_id
          in: path
          description: A unique integer ID for identifying an Event
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/EventDetails'
        '404':
          description: Not Found
        '500':
          description: Server Error
    post:
      tags:
        - Event management
      summary: Register to attend an event
      description: Adds the logged in user to the list of attendees for an event.
      operationId: AttendEvent
      parameters:
        - name: event_id
          in: path
          description: A unique integer ID for identifying an Event
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: OK
        '401':
          description: Unauthorised
        '403':
          description: >-
            Forbidden one of "You are already registered", "Event is at
            capacity", or "Registration is closed"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '404':
          description: Not Found
        '500':
          description: Server Error
      security:
        - User: []
    delete:
      tags:
        - Event management
      summary: Delete an event
      description: >-
        Delete a event at a given ID. The event will be archieved meaning that
        no one will be able to register. However, the event will still be
        visible. This can be done by setting the close_registration time to -1.
      operationId: deleteEvent
      parameters:
        - name: event_id
          in: path
          description: A unique integer ID for identifying an Event
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: OK
        '401':
          description: Unauthorised
        '403':
          description: You can only delete your own events
        '404':
          description: Not Found
        '500':
          description: Server Error
      security:
        - User: []
    patch:
      tags:
        - Event management
      summary: Update a event
      description: Update the details of an event at a given ID.
      operationId: updateEvent
      parameters:
        - name: event_id
          in: path
          description: A unique integer ID for identifying an Event
          required: true
          schema:
            type: integer
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AddEvent'
      responses:
        '200':
          description: OK
        '400':
          description: Bad Request
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: Unauthorised
        '403':
          description: You can only update your own events
        '404':
          description: Not Found
        '500':
          description: Server Error
      security:
        - User: []
  /event/{event_id}/question:
    post:
      tags:
        - Event question management
      summary: Ask a question about an event
      description: Creates a new question related to a particular event.
      operationId: askQuestion
      parameters:
        - name: event_id
          in: path
          description: A unique integer ID for identifying an Event
          required: true
          schema:
            type: integer
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AskQuestion'
      responses:
        '201':
          description: Created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AskQuestionResponse'
        '400':
          description: Bad Request
        '401':
          description: Unauthorised
        '403':
          description: >-
            You cannot ask questions on events you are not registered for or
            your own events
        '500':
          description: Server Error
      security:
        - User: []
  /question/{question_id}:
    delete:
      tags:
        - Event question management
      summary: Delete a question
      description: >-
        Delete a question at a given ID. Only event creators and the authors of
        questions can delete.
      operationId: deleteQuestion
      parameters:
        - name: question_id
          in: path
          description: A unique integer ID for identifying a question
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: OK
        '401':
          description: Unauthorised
        '403':
          description: >-
            You can only delete questions that have authored, or for events that
            you have created
        '404':
          description: Not Found
        '500':
          description: Server Error
      security:
        - User: []
  /question/{question_id}/vote:
    post:
      tags:
        - Event question management
      summary: Upvote a question
      description: >-
        Upvote a question at a given ID. You may upvote your own questions, but
        you can not vote on the same question twice
      operationId: upvoteQuestion
      parameters:
        - name: question_id
          in: path
          description: A unique integer ID for identifying a question
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: OK
        '401':
          description: Unauthorised
        '403':
          description: You have already voted on this question
        '404':
          description: Not Found
        '500':
          description: Server Error
      security:
        - User: []
    delete:
      tags:
        - Event question management
      summary: Downvote a question
      description: >-
        Downvote a question at a given ID. You may downvotevote your own
        questions, but you can not vote on the same question twice
      operationId: downvoteQuestion
      parameters:
        - name: question_id
          in: path
          description: A unique integer ID for identifying a question
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: OK
        '401':
          description: Unauthorised
        '403':
          description: You have already voted on this question
        '404':
          description: Not Found
        '500':
          description: Server Error
      security:
        - User: []
  /search:
    get:
      tags:
        - Event management
      summary: Search for an event
      description: |
        NOTE: Leave this end point until last - it is the most difficult.

        Search the list of events. 

        Query parameters can be used to filter the search:

        q: a string to search for the name of the event
        status:
          MY_EVENTS - filter events that you have created
          ATTENDING - filter events that you are registered to attend
          OPEN - filter events that are still open for registration
          ARCHIVE - filter past events
        limit: limit the number of results for pagination
        offset: used to scroll through pages of results
      operationId: searchEvents
      parameters:
        - name: q
          in: query
          description: >-
            A string used to filter the search end point (i.e., to find specific
            event)
          required: false
          schema:
            type: string
        - name: status
          in: query
          description: >-
            A string used to filter the search end point (i.e., to find specific
            users). Must be one of MY_EVENTS, ATTENDING, OPEN, ARCHIVE
          required: false
          schema:
            type: string
        - name: limit
          in: query
          description: The number of items to return
          required: false
          schema:
            maximum: 100
            minimum: 1
            type: integer
            default: 20
        - name: offset
          in: query
          description: >-
            The number of items to skip before starting to collect the result
            set (e.g. for pagination)
          required: false
          schema:
            minimum: 0
            type: integer
            default: 0
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Events'
        '400':
          description: Bad Request
        '500':
          description: Server Error
components:
  schemas:
    AddUser:
      required:
        - email
        - first_name
        - last_name
        - password
      type: object
      properties:
        first_name:
          type: string
          example: Xia
        last_name:
          type: string
          example: Cui
        email:
          type: string
          example: x.cui@mmu.ac.uk
        password:
          type: string
          example: Hello123!
    AddUserResponse:
      type: object
      properties:
        user_id:
          type: integer
          example: 14
    ErrorResponse:
      type: object
      properties:
        error_message:
          type: string
          example: Relevant error message goes in here
    LoginUser:
      required:
        - email
        - password
      type: object
      properties:
        email:
          type: string
          example: x.cui@mmu.ac.uk
        password:
          type: string
          example: Hello123!
    LoginResponse:
      type: object
      properties:
        user_id:
          type: integer
          example: 14
        session_token:
          type: string
          example: b5d9e7be6c97aa855f721b6e742120f2
    AddEvent:
      required:
        - close_registration
        - description
        - location
        - max_attendees
        - name
        - start
      type: object
      properties:
        name:
          type: string
          example: NodeJS developer meetup Manchester
        description:
          type: string
          example: >-
            Our regular monthly catch-up to discuss all things Node. This month,
            our guest speaker Jacob Alcock will be discussing the fundamentals
            of securing our Node applications
        location:
          type: string
          example: Federal Cafe and Bar
        start:
          type: integer
          example: 89983256
        close_registration:
          type: integer
          example: 89983256
        max_attendees:
          type: integer
          example: 20
    AddEventResponse:
      type: object
      properties:
        event_id:
          type: integer
          example: 39
    EventDetails:
      type: object
      properties:
        event_id:
          type: integer
          example: 39
        creator:
          $ref: '#/components/schemas/EventDetails_creator'
        name:
          type: string
          example: Coffee and catch up
        description:
          type: string
          example: Meet your employer, with our quarterly coffee catch up
        location:
          type: string
          example: Starbucks - Oxford Road
        start:
          type: integer
          example: 89983256
        close_registration:
          type: integer
          example: 89983256
        max_attendees:
          type: integer
          example: 20
        number_attending:
          type: integer
          example: 16
        attendees:
          type: array
          items:
            $ref: '#/components/schemas/Attendee'
        questions:
          type: array
          items:
            $ref: '#/components/schemas/Question'
    Attendee:
      type: object
      properties:
        user_id:
          type: integer
          example: 7
        first_name:
          type: string
          example: Xia
        last_name:
          type: string
          example: Cui
        email:
          type: string
          example: x.cui@mmu.ac.uk
    Question:
      type: object
      properties:
        question_id:
          type: integer
          example: 9898
        question:
          type: string
          example: What time will the event end?
        votes:
          type: integer
          example: 876
        asked_by:
          $ref: '#/components/schemas/Question_asked_by'
    AskQuestion:
      required:
        - question
      type: object
      properties:
        question:
          type: string
          example: What time will the event end?
    AskQuestionResponse:
      type: object
      properties:
        question_id:
          type: integer
          example: 39
    Events:
      type: array
      items:
        $ref: '#/components/schemas/Event'
    Event:
      type: object
      properties:
        event_id:
          type: integer
          example: 39
        creator:
          $ref: '#/components/schemas/EventDetails_creator'
        name:
          type: string
          example: Coffee and catch up
        description:
          type: string
          example: Meet your employer, with our quarterly coffee catch up
        location:
          type: string
          example: Starbucks - Oxford Road
        start:
          type: integer
          example: 89983256
        close_registration:
          type: integer
          example: 89983256
        max_attendees:
          type: integer
          example: 20
    EventDetails_creator:
      type: object
      properties:
        creator_id:
          type: integer
          example: 7
        first_name:
          type: string
          example: Xia
        last_name:
          type: string
          example: Cui
        email:
          type: string
          example: x.cui@mmu.ac.uk
    Question_asked_by:
      type: object
      properties:
        user_id:
          type: integer
          example: 654
        first_name:
          type: string
          example: Xia
  parameters:
    event_id:
      name: event_id
      in: path
      description: A unique integer ID for identifying an Event
      required: true
      schema:
        type: integer
    question_id:
      name: question_id
      in: path
      description: A unique integer ID for identifying a question
      required: true
      schema:
        type: integer
    q:
      name: q
      in: query
      description: >-
        A string used to filter the search end point (i.e., to find specific
        event)
      required: false
      schema:
        type: string
    status:
      name: status
      in: query
      description: >-
        A string used to filter the search end point (i.e., to find specific
        users). Must be one of MY_EVENTS, ATTENDING, OPEN, ARCHIVE
      required: false
      schema:
        type: string
    limit:
      name: limit
      in: query
      description: The number of items to return
      required: false
      schema:
        maximum: 100
        minimum: 1
        type: integer
        default: 20
    offset:
      name: offset
      in: query
      description: >-
        The number of items to skip before starting to collect the result set
        (e.g. for pagination)
      required: false
      schema:
        minimum: 0
        type: integer
        default: 0
  securitySchemes:
    User:
      type: apiKey
      name: X-Authorization
      in: header