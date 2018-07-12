const validate = require('./validate');

describe('validate', function() {
    it('should return a failure if passed an invalid model', function() {
        let data = {};

        let result = validate(data, 'InvalidModel');

        expect(result.length).toBe(1);
        expect(result[0].type).toBe('model_not_found');
        expect(result[0].severity).toBe('failure');
    });

    it('should return no errors for a valid Event', function() {
        let event = {
            "@context": "https://www.openactive.io/ns/oa.jsonld",
            "type": "Event",
            "name": "Tai chi Class",
            "description": "A Tai chi class",
            "duration": "PT1H",
            "url": "http://www.example.org/events/1",
            "startDate": "2017-03-22T20:00:00",
            "activity": "Tai Chi",
            "eventStatus": "http://schema.org/EventScheduled",
            "organizer": {
                "type": "Organization",
                "name": "Example Co",
                "url": "http://www.example.org",
                "email": "hello@example.org",
                "logo": "http://www.example.org/logo.png",
                "sameAs": [
                    "http://www.facebook.com/example-org"
                ]
            },
            "location": {
                "type": "Place",
                "name": "ExampleCo Gym",
                "url": "http://www.example.org/locations/gym",
                "address": {
                    "type": "PostalAddress",
                    "streetAddress": "1 High Street",
                    "addressLocality": "Bristol",
                    "addressRegion": "Bristol",
                    "addressCountry": "UK",
                    "postalCode": "BS1 4SD"
                },
                "geo": {
                    "latitude": 51.4034423828125,
                    "longitude": -0.2369088977575302,
                    "type": "GeoCoordinates"
                },
            }
        };

        let result = validate(event, 'Event');

        expect(result.length).toBe(0);
    });

    it('should provide a jsonpath to the location of a problem', function() {
        // This event is missing location addressRegion, which is a recommended field
        let event = {
            "@context": "https://www.openactive.io/ns/oa.jsonld",
            "type": "Event",
            "name": "Tai chi Class",
            "description": "A Tai chi class",
            "duration": "PT1H",
            "url": "http://www.example.org/events/1",
            "startDate": "2017-03-22T20:00:00",
            "activity": "Tai Chi",
            "eventStatus": "http://schema.org/EventScheduled",
            "organizer": {
                "type": "Organization",
                "name": "Example Co",
                "url": "http://www.example.org",
                "email": "hello@example.org",
                "logo": "http://www.example.org/logo.png",
                "sameAs": [
                    "http://www.facebook.com/example-org"
                ]
            },
            "location": {
                "type": "Place",
                "name": "ExampleCo Gym",
                "url": "http://www.example.org/locations/gym",
                "address": {
                    "type": "PostalAddress",
                    "streetAddress": "1 High Street",
                    "addressLocality": "Bristol",
                    "addressCountry": "UK",
                    "postalCode": "BS1 4SD"
                },
                "geo": {
                    "latitude": 51.4034423828125,
                    "longitude": -0.2369088977575302,
                    "type": "GeoCoordinates"
                },
            }
        };

        let result = validate(event, 'Event');

        expect(result.length).toBe(1);

        expect(result[0].path).toBe('$.location.address.addressRegion');
    });

});
