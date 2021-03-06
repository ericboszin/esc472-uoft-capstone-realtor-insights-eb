import React, { Component } from 'react';
import LoadingSpinner from './LoadingSpinner';
import SortableTable from './SortableTable';


class TableContainer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			userData: this.props.location.state.userData,
			rows: []
		}
	}
	
	sort(a, b) {
		// Compare the 2 districts
		if (a.district < b.district) return -1;
		if (a.district > b.district) return 1;
		return 0;
	}

	formatRows(model1, model2, model3) {
		model1.sort(this.sort);
		model2.sort(this.sort);
		model3.sort(this.sort);
		var rows = [];
		for(var i = 0; i < model1.length; i++) {
			if((model1[i].district !== model2[i].district) || (model1[i].district !== model3[i].district)) {
				return console.log("Error! Out-of-order", model1[i].district, model2[i].district, model3[i].district, i);
			}
			rows[i] = { 
				district: model1[i].district,
				personalFit: {
					probability: model1[i].probability, 
					median_age: model1[i].median_age,  
					majority_race: model1[i].majority_race, 
					majority_empind: model1[i].majority_empind,
					median_income: model1[i].median_income,
					median_bed: model1[i].median_bed,
					median_veh: model1[i].median_veh
				},
				publicPerception: { 
					sentiment: model2[i].sentiment,
					histogram: model2[i].histogram
				},
				financialOutlook: {
					year_1: model3[i].year_1,
					year_3: model3[i].year_3,
					year_5: model3[i].year_5,
					projection: model3[i].projection,
					current: model3[i].current
				}
			}
		}
		return rows;
	}

	componentDidMount() {
		const user = this.state.userData;
		this.setState({ isLoading: true });
		const urls = [
			'https://radiant-fortress-14740.herokuapp.com/runModel?age='+user.age+
				'&race='+user.race+
				'&occupation='+user.occupation+
				'&income='+user.income+
				'&bedrooms='+user.bedrooms+
				'&vehicles='+user.vehicles,
			'https://radiant-fortress-14740.herokuapp.com/getData/sentiment.json',
			'https://radiant-fortress-14740.herokuapp.com/getData/finance.json'
		];
		
		Promise.all(urls.map(url =>
			fetch(url)
				.then(checkStatus)                 
				.then(parseJSON)
				.catch(error => console.log('There was a problem!', error))
			))
			.then(data => {
				this.setState({
					rows: this.formatRows(data[0], data[1], data[2]),
					isLoading: false
				});
			});

		function checkStatus(response) {
			if (response.ok) {
				return Promise.resolve(response);
			} else {
				return Promise.reject(new Error(response.statusText));
			}
		}
		
		function parseJSON(response) {
			return response.json();
		}
	}  

	render() {
		return (
			<div className="container">
				<div className="row justify-content-center">
					<div className="col pt-5">
						{this.state.isLoading ? <LoadingSpinner /> :
							<div>
								<h2>Here are your results!</h2>
								<div className="pt-5">
									<SortableTable 
										rows={this.state.rows}
									/>
								</div>
							</div>
						}
					</div>
				</div>
			</div>
		);
	}
}

export default TableContainer;