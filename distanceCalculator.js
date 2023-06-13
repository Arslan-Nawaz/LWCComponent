import { LightningElement } from 'lwc';
import getAddress from '@salesforce/apex/SearchApiAddressCtrl.getAddress';
import getAddressDetailsByPlaceId from '@salesforce/apex/SearchApiAddressCtrl.getPlaceDetails';
import getCalculatedDistAndTime from '@salesforce/apex/SearchApiAddressCtrl.calculateDistAndTime';
import getFareValueForModeOfTravel from '@salesforce/apex/SearchApiAddressCtrl.getFareValueForMode';
export default class DistanceCalculator extends LightningElement {
    addressRecommendations = [];
    destinationAddressRecommendations = [];
    selectedAddress = '';
    selectedOriginAddress='';
    selectedDestinationAddress='';
    addressDetail = {};
    calculatedDistance;
    calculatedTime;
    city;
    country;
    pincode;
    state;
    originPlaceId='';
    destinationPlaceId='';
    // travelOptions = [
    //     {'Label':'Bicycling', 'Value': 'Bicycling'},
    //     {'Label': 'Walking', 'Value' : 'Walking'},
    //     {'Label' : 'Driving', 'Value' : 'Driving'},
    //     {'Label' : 'Transit', 'Value' : 'Transit'}
    // ];
    get travelOptions() {
        return [
            { label: 'Walking', value: 'walking' },
            { label: 'Driving', value: 'driving' },
            { label: 'Transit', value: 'transit' },
        ];
    }
    selectedModeValue;
    get hasRecommendations() {
        return (this.addressRecommendations !== null && this.addressRecommendations.length);
    }
     
    get hasDestinationRecommendations() {
        return (this.destinationAddressRecommendations !== null && this.destinationAddressRecommendations.length);
    }

    handleChange(event) {
        event.preventDefault();
        let searchText = event.target.value;
        if (searchText) this.getAddressRecommendations(searchText);
        else this.addressRecommendations = [];
    }
 
    getAddressRecommendations(searchText) {
        getAddress({ searchString: searchText })
            .then(response => {
                let addressRecommendations = [];
                response.forEach(prediction => {
                    addressRecommendations.push({
                        main_text: prediction.AddComplete,
                        secondary_text: prediction.AddComplete,
                        place_id: prediction.placeId,
                    });
                });
                this.addressRecommendations = addressRecommendations;
            }).catch(error => {
                console.log('error : ' + JSON.stringify(error));
            });
    }
 
    resetAddress(){
        this.city = '';
        this.country = '';
        this.pincode = '';
        this.state = '';
    }
  
    handleAddressRecommendationSelect(event) {
        event.preventDefault();
        let placeId = event.currentTarget.dataset.value;
        this.originPlaceId=event.currentTarget.dataset.value;
        this.addressRecommendations = [];
        this.selectedOriginAddress = '';
        this.resetAddress();
         
 
        getAddressDetailsByPlaceId({ placeId: placeId })
            .then(response => {
                response = JSON.parse(response);
                response.result.address_components.forEach(address => {
                    let type = address.types[0];
                    console.log('The address type is::::',address.types);
                    if(type="country"){
                        this.selectedOriginAddress = this.selectedOriginAddress + ' ' + address.long_name;
                            this.country = address.long_name;
                    }
                });
            })
            .catch(error => {
                console.log('error : ' + JSON.stringify(error));
            });
    }

    handleDestinationChange(event) {
        event.preventDefault();
        let searchText = event.target.value;
        if (searchText) this.getDestinationAddressRecommendations(searchText);
        else this.addressRecommendations = [];
    }
    getDestinationAddressRecommendations(searchText) {
        getAddress({ searchString: searchText })
            .then(response => {
                let destinationAddressRecommendations = [];
                response.forEach(prediction => {
                    destinationAddressRecommendations.push({
                        main_text: prediction.AddComplete,
                        secondary_text: prediction.AddComplete,
                        place_id: prediction.placeId,
                    });
                });
                this.destinationAddressRecommendations = destinationAddressRecommendations;
            }).catch(error => {
                console.log('error : ' + JSON.stringify(error));
            });
    }
    handleDestinationAddressRecommendationSelect(event) {
        event.preventDefault();
        let place2Id = event.currentTarget.dataset.value;
        this.destinationPlaceId=event.currentTarget.dataset.value;
        this.destinationAddressRecommendations = [];
        this.selectedDestinationAddress = '';
        this.resetAddress();
         
 
        getAddressDetailsByPlaceId({ placeId: place2Id })
            .then(response => {
                response = JSON.parse(response);
                response.result.address_components.forEach(address => {
                    let type = address.types[0];
                    console.log('The address type is::::',address.types);
                    if(type="country"){
                        this.selectedDestinationAddress = this.selectedDestinationAddress + ' ' + address.long_name;
                            this.country = address.long_name;
                    }
                });
            })
            .catch(error => {
                console.log('error : ' + JSON.stringify(error));
            });
    }

    getDirectionsClickHandler(event){
        if(this.selectedAddress!=null && this.selectedDestinationAddress!=null){
            console.log('The origin place id is:::::',this.originPlaceId);
            console.log('The destination place id is :::::',this.destinationPlaceId);
            getCalculatedDistAndTime({ placeIdOfOrigin: this.originPlaceId, placeIdOfDestination: this.destinationPlaceId, modeOfTravel: this.selectedModeValue })
            .then(response => {
                console.log('The response is received in the method:::::',response);
                // response.result.address_components.forEach(address => {
                //     let type = address.types[0];
                //     console.log('The address type is::::',address.types);
                //     if(type="country"){
                //         this.selectedDestinationAddress = this.selectedDestinationAddress + ' ' + address.long_name;
                //             this.country = address.long_name;
                //     }
                // });
            })
            .catch(error => {
                console.log('error : ' + JSON.stringify(error));
            });
        }
    }

    selectedMode(event){
        this.selectedModeValue = event.target.value;
        getFareValueForModeOfTravel({ modeOfTravel : this.selectedModeValue})
        .then(response =>{
            console.log('The resonse received is:::::', response);
        })
        .catch(error => {
            console.log('error : ' + JSON.stringify(error));
        });

    }
}
