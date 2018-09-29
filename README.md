# sonub-log-server

NodeJS Server for sonub logging

## Protocol

### Page view

#### Page view request

```` json
{
    function: 'pageView',
    domain?: string,
    from_year: number,
    from_month: number,
    from_day: number,
    to_year: number,
    to_month: number,
    to_day: number
}
````

#### Page view response

```` json
{
    function: 'pageView',
    domain?: string,
    from_year: number,
    from_month: number,
    from_day: number,
    to_year: number,
    to_month: number,
    data: {
        [date: string]: number
    }
}
````

## Unit testing

* How to generate test data

```` sh
node generate-test-data.js
````

* How to run test

```` sh
node test.js
````
