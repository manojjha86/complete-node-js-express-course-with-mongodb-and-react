class ApiFeatures{
    constructor(queryObj, queryParam){
        this.queryObj = queryObj;
        this.queryParam = queryParam
    }

    filter(){
        //Excluding other fields not required in filter object
        const excludeFields = ['sort', 'limit', 'page', 'fields'];

        const queryObj = { ...this.queryParam};
        excludeFields.forEach((el) => {
            delete queryObj[el];
        })
        const filterQuery = getFinalFilterQuery(queryObj);


        //Querying the documents from the collection
        this.queryObj = this.queryObj.find(filterQuery);

        return this;
    }

    //Sorting results
    sort(){
        if(this.queryParam.sort){
            const sortBy = this.queryParam.sort.split(',').join(' ');
            this.queryObj = this.queryObj.sort(sortBy);
        }else{
            this.queryObj = this.queryObj.sort('cheapestPrice');
        }
        return this;
    }

    //Field limiting
    limitFields(){
        if(this.queryParam.fields){
            const fields = this.queryParam.fields.split(',').join(' ');
            this.queryObj = this.queryObj.select(fields);
        }else{
            this.queryObj = this.queryObj.select('-__v');
        }
        return this;
    }

    //Pagination
    paginate(){
        const limit = +this.queryParam.limit || 10;
        const page = +this.queryParam.page || 1;
        const skip = (page - 1) * limit;

        this.queryObj = this.queryObj.skip(skip).limit(limit);

        // if(this.queryParam.page){
        //     const totalHotels = await Hotel.countDocuments();
        //     if(skip >= totalHotels){
        //         throw new Error('This page is not found!')
        //     }
        // }

        return this;
    }

}

getFinalFilterQuery = (queryObj) => {
    const finalFilterQuery = {};

    //{ city: 'Mumbai', 'cheapestPrice[lt]': '300', 'ratings[gte]': '4.5' }

    for(const key in queryObj){
        const value = queryObj[key];
        const match = key.match(/^(.*)\[(gt|gte|lt|lte)\]$/);

        if(match){
            const fieldName = match[1];
            const operator = `$${match[2]}`;

            if(!finalFilterQuery[fieldName]){
                //{cheapestPrice: {}}
                finalFilterQuery[fieldName] = {}
            }
            //{cheapestPrice: { $lt: 300}}
            finalFilterQuery[fieldName][operator] = value;
        }else{
            finalFilterQuery[key] = value;
        }
    }
    console.log(queryObj);
    console.log(finalFilterQuery);

    return finalFilterQuery;
}

module.exports = ApiFeatures;