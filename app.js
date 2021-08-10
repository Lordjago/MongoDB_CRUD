const { MongoClient } = require('mongodb');

main = async () => {
    /**
    * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
    * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
    */
    const connectionString = "mongodb+srv://root:root@clustertest.adfbz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

    //Creating an object from MongoClient which return a Promise to client
    const client = new MongoClient(connectionString);

   await client.connect();

        try {
            // Connect to the MongoDB cluster
            await client.connect();

            //Delete many listing that has not been updated recently
            await deleteListingScrapedBeforeDate(client, new Date("2021-08-10"));

            //Deleting a single document
            // await deleteListingByName(client, "Unknown");

            //Updating a Listing to have a particular property they not having before
            // await updateAllListeningToHavePropertyType(client);

            // updateListingByName or upsertListing can now be used for update, just that if the name we not looking for deosnt exist
            // upsert will create one for us
            // await upsertListingByName(client, "Loverly Lots", {bedrooms: 4, bathrooms: 4});

            //Find with cretaria call function
            // await findListingWithMinimumBedroomsAndMostRecentReviews(client, {
            //     minimumNumOfBedrooms : 2,
            //     minimumNumOfBathrooms : 1,
            //     maximumNumOfResult : 8
            // });

            //Find LIsting by name
            // await findOneListingByName(client, "Loverly Loft");

            // Multiple listing call function
            // await createMultipleListing(client, [{
            //     name: "Loverly Loft",
            //     summary: "What a class",
            //     bedrooms: 1,
            //     bathrooms: 1
            // }, {
            //     name: "Loverly Lot",
            //     summary: "What a class",
            //     bedrooms: 3,
            //     bathrooms: 1
            // } ]) ;

            //A single listening call function
            // await createListing(client, {
            //     name: "Loverly Loft",
            //     summary: "What a class",
            //     bedrooms: 1,
            //     bathrooms: 1
            // },);

              //Will display if the database is connected
            console.log('Connected to Database');
        } catch (error) {
            console.log(error);
        } finally {
            await client.close();
        }
    
}

main().catch(console.error);

//List all the databases in the cluster
 async function listDatabases(client) {
    const databasesList = await client.db().admin().listDatabases();

    console.log("Databases");
    databasesList.databases.forEach(db => {
        console.log(`- ${db.name}`);
    });
}
    
//Inserting a single document
 createListing = async  (client, newListing) => {
    const result = await client.db('sample_db').collection('ListeningAndReview').insertOne(newListing);

    console.log(`New listening cretaed with the following id: ${result.insertedId}`);
 }
//Inserting a multiple document, it must be put inside an array
 createMultipleListing = async (client, newListing) => {
    const result = await client.db('sample_db').collection('ListeningAndReviewMultiple').insertMany(newListing);

    console.log(`${result.insertedCount} has been created with the following id(s): `);
     console.log(result.insertedIds);
 }

 //Find a document ny name

 findOneListingByName = async (client, nameOfListing) => {
     const result = await client.db('sample_db').collection('ListeningAndReviewMultiple').findOne({name: nameOfListing});

     if (result) {
         console.log(result);
     } else {
         console.log('No list found');
     }
     

 }
//Finding list that meet a requirement
 findListingWithMinimumBedroomsAndMostRecentReviews = async (client, {
     minimumNumOfBedrooms = 0,
     minimumNumOfBathrooms = 0,
     maximumNumOfResult = Number.MAX_SAFE_INTEGER
 } = {}) => {
     const cursor =  client.db('sample_db').collection('ListeningAndReviewMultiple').find({
         bedrooms: { $gte: minimumNumOfBedrooms },
         bathrooms: { $gte: minimumNumOfBathrooms }
     }).sort({ bedrooms : -1 }).limit(maximumNumOfResult);

     const results = await cursor.toArray();

     if (results.length > 0) {
         console.log(`Found listing(s) with at least${ minimumNumOfBedrooms } bedrooms and ${ minimumNumOfBathrooms } bathrooms`);

         results.forEach((result, i) => {
             console.log(`--${i + 1}.name: ${ result.name }`);
             console.log(`_id: ${result._id}`);
             console.log(`summary: ${result.summary}`);
             console.log(`bedrooms: ${result.bedrooms}`);
             console.log(`bathrooms: ${result.bathrooms}`);
         });
     } else {
         console.log(`No Listing Found  with at least ${minimumNumOfBedrooms} bedrooms and ${minimumNumOfBathrooms} bathrooms`);
     }
 }

    //Update a list by name

updateListingByName = async (client, nameOfTheListing, updatedListing) => {
    const result = await client.db('sample_db').collection('ListeningAndReviewMultiple').updateOne({
        name: nameOfTheListing
    }, {$set: updatedListing});

    console.log(`${ result.matchedCount } document(s) matched the query cretaria`);
    console.log(`${result.modifiedCount} document(s) was/were updated`);

}

//Upsert used use to update a list and if the list doent exist, it create 1 

upsertListingByName = async (client, nameOfTheListing, updatedListing) => {
    const result = await client.db('sample_db').collection('ListeningAndReviewMultiple').updateOne(
        {
            name: nameOfTheListing
        },
        { 
            $set: updatedListing
        },
        {
            upsert: true //If not exist create one
        });

    console.log(`${result.matchedCount} document(s) matched the query cretaria`);
    
    if (result.upsertedCount > 0) {
        console.log(`One Document was inserted with the id of : ${result.upsertedId }`);
        
    } else {
        console.log(`${result.modifiedCount} document(s) was/were updated`);
    }

}

//Updating a Listing to have a particular property they not having before
updateAllListeningToHavePropertyType = async (client) => {
    const result = await client.db('sample_db').collection('ListeningAndReviewMultiple').updateMany(
        {
            property_type: {$exists: false }
        },
        {
            $set: { property_type: "Unknown" }
        }
        );
    console.log(`${result.matchedCount} document(s) matched the query cretaria`);
    console.log(`${result.modifiedCount} document(s) was/were updated`);

}

//Deleting a List from a document
deleteListingByName = async (client, nameOfListing) => {
    const result = await client.db('sample_db').collection('ListeningAndReviewMultiple').deleteOne({name: nameOfListing});

    console.log(`${result.deletedCount} document(s) was/were deleted`);
}


//Delete many listing that has not been updated recently

deleteListingScrapedBeforeDate = async (client, date) => {
   const result = await client.db('sample_db').collection('ListeningAndReviewMultiple').deleteMany(
        {"last_scraped": {$lt: date}}
    );
    console.log(`${result.deletedCount} document(s) was/were deleted`);
}