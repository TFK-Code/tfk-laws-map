/*global TfkLaws, Backbone*/
TfkLaws.Routers = TfkLaws.Routers || {};

(function() {
  'use strict';

  TfkLaws.Data = [];
  TfkLaws.Countries = [];
  TfkLaws.Codes = codes;
  TfkLaws.Centroids = centroids;
  TfkLaws.DataGrouped = [];
  TfkLaws.Selected = false;


  TfkLaws.Routers.App = Backbone.Router.extend({

    routes: {
      '': 'mapPage'
    },


		/*
		* mapPage: Pulls in the api data and builds countries object
		*/
    mapPage: function() {
    
      $('.loading').show();

      $.ajax({
        dataType: "json",
        url: 'http://crossorigin.me/http://dev.tobaccocontrollaws.org/country/getCountryList/getCountryData'
      }).done(function(data) {


        $.each(data.countries, function(index, country) {
        
          if (country.name === 'United kingdom') {
            country.name = 'England';
          }

						TfkLaws.Data.push({
							"country": country.name,
							"code": country.abbr,
							"lawOnly": country.lawAnalysis,
							"signedFCTC": country.signedFCTC
						});
						
			  });


				// Initiates the map and adds countries topojson
        L.mapbox.accessToken = 'pk.eyJ1IjoiZG1jY2FyZXkiLCJhIjoiRl9FV3ZXNCJ9.l1rdsm-F9Vwzcimtf1qMHg';
        var map = L.mapbox.map('map', null, {
            worldCopyJump: true
          })
          .setView([40, 0], 2);
        
        map.scrollWheelZoom.disable();

        TfkLaws.Countries = omnivore.topojson('assets/countries.json')
          .on('ready', function(layer) {
              
            this.eachLayer(function(dist) {
              
              dist.setStyle(getStyle(dist.feature));
              onEachFeature(dist.feature, dist);

            })

          })
          .addTo(map)
          .on('ready', finishedLoading);
          
          TfkLaws.DataGrouped = _.groupBy(TfkLaws.Data, 'code');
          
          function finishedLoading() {
            
            $('.loading').hide();
            $('.search-ui').fadeIn();
            
          }
          
          
        // Add the first tour item
        $('#tour h4').append(tour[0]['title']);
				$('#tour p').append(tour[0]['body']);
				$('#tour, #legend').fadeIn();


				/*
				* On each Feature :: builds country tooltips 
				*/
        function onEachFeature(feature, layer) {

          var countryCode = feature.properties.iso_a2;
          var countryName = feature.properties.admin;
          var countryHasData = false;
          var countryHasAnalysis = false;
          var country = '';
          var domain = 'http://dev.tobaccocontrollaws.org/';
          var countrySlug = '';
          var signedFCTC = '';
          var analysisLink = '';
          var analysisTable = '';

          $.each(TfkLaws.Data, function(index, value) {

            if (countryCode === value.code) {

              signedFCTC = value.signedFCTC.split('Smoke Free Places')[0];
              countryHasData = true;
              countryHasAnalysis = value.lawOnly;
              country = value.country;
              countrySlug = value.country.replace(/\s+/g, '-').toLowerCase();

              if (countryHasAnalysis === true) {

                analysisLink = '<a class="btn btn-default btn-sm btn-success" target="_parent" href="' + domain + 'litigation/advancedsearch/?country=' + country + '">Litigation</a>';
                analysisTable = '<table>' + '<tr>' + '<td class="title" colspan="3">Analysis - <a href="' + domain + 'legislation/country/' + country + '/sf-indoor">View summary &raquo;</a></td>' + '<tr>' + '<td><a target="_parent" href="' + domain + 'legislation/country/' + country + '/sf-indoor" class="icon"></a> <a target="_parent" href="' + domain + 'legislation/country/' + country + '/sf-indoor">Smoke Free</a></td>' + '<td><a target="_parent" href="' + domain + 'legislation/country/' + country + '/aps-regulated-forms" class="icon icon-advertising"></a> <a target="_parent" href="' + domain + 'legislation/country/' + country + '/sf-indoor">Advertising</a></td>' + '<td><a target="_parent" href="' + domain + 'legislation/country/' + country + '/pl-health-warnings" class="icon icon-packaging"></a> <a target="_parent" href="' + domain + 'legislation/country/' + country + '/sf-indoor">Packaging</a></td>' + '</tr>' + '<tr>' + '<td class="title" colspan="3">Fact sheets - <a target="_parent" href="' + domain + '/legislation/factsheet/policy_status/' + countrySlug + '">Download summary &raquo;</a></td>' + '</tr>' + '<tr class="fact-sheets">' + '<td><a target="_parent" href="' + domain + 'legislation/factsheet/sf/' + countrySlug + '" class="icon"><span class="pdf">pdf</span></a> <a target="_parent" href="' + domain + 'legislation/factsheet/sf/' + countrySlug + '">Smoke Free</a></td>' + '<td><a target="_parent" href="' + domain + 'legislation/factsheet/aps/' + countrySlug + '" class="icon icon-advertising"><span class="pdf">pdf</span></a> <a target="_parent" href="' + domain + 'legislation/factsheet/aps/' + countrySlug + '">Advertising</a></td>' + '<td><a target="_parent" href="' + domain + 'legislation/factsheet/pl/' + countrySlug + '" class="icon icon-packaging"><span class="pdf">pdf</span></a> <a target="_parent" href="' + domain + 'legislation/factsheet/pl/' + countrySlug + '">Packaging</a></td>' + '</tr>' + '</table>';

              }

            }

          });


          if (countryHasData === true) {

            layer.bindPopup('<h4>' + countryName + '</h4>' + '<p>' + signedFCTC + '</p>' + '<a class="btn btn-default btn-sm btn-success" target="_parent" href="' + domain + 'legislation/country/' + countrySlug + '/summary' + '">Summary</a> ' + '<a class="btn btn-default btn-sm btn-success" target="_parent" href="' + domain + 'legislation/country/' + countrySlug + '/laws' + '">Laws</a> ' + analysisLink + analysisTable);
          
          } else {
           
            layer.bindPopup('<h4>' + countryName + '</h4>' + '<p>We do not have any tobacco control laws or litigation for this country. If you have any information on this country, please <a target="_parent" href="' + domain + 'contact/">contact us</a>.</p>');
          
          }

        }


				/*
				* Get styles :: returns country fill style
				*/
        function getStyle(feature) {

          var countryCode = feature.properties.iso_a2;
          var color = '#eee';
          var fillOpacity = 0.3;

          $.each(TfkLaws.Data, function(index, value) {

            if (countryCode === value.code) {

              if (value.lawOnly === true) {
                color = '#eee';
                fillOpacity = 1;
              }

              if (value.lawOnly === false) {
                color = '#eee';
                fillOpacity = 0.5;
              }

            }

          });

          return {
            'stroke': true,
            'weight': 1.5,
            'opacity': 1,
            'color': '#fff',
            'fillOpacity': fillOpacity,
            'fillColor': '#ccc',
            'title': countryCode,
            'class': countryCode
          }

        }


				/*
				* Search :: looks up matching countries with data
				*/
        function search() {

          var searchString = $('#search').val().toLowerCase();

          $('.search-results-list').empty();

          $.each(TfkLaws.Data, function(index, value) {
                
							if (value.country.toLowerCase().indexOf(searchString) > -1) {

								$('.search-results').show();

								$('.search-results-list').append('<li><a class="country-search-link" href="#" data-code="' + value.code + '">' + value.country + '</li></a>');
					
							}


							if (searchString === '') {
					
								$('.search-results').hide();
						
							}

          });

        }
        
        
				/*
				* Highlight country :: highlights borders for a country
				*/    
        function highlightCountry(code) {
        
          TfkLaws.Countries.setStyle({
            color: '#fff'
          });
          
          
          $.each(TfkLaws.Countries._layers, function(index, value) {
          
             if (value.feature.properties.iso_a2 === code) {
              
              value.setStyle({
                color: '#333'
              });
              
              value.bringToFront();
              
              console.log(value);
              
              if (value._popupContent || value._popup._content) {
                
                var content = '';
                
                if (value._popupContent) {
                 content = value._popupContent;
                } else {
                  content = value._popup._content;
                }
                
                $('#info').html(content);
              }
              
             }
          
          });
        
        }
        
        
        // Click on country
        TfkLaws.Countries.on('click', function(e) {
          
           e.layer.closePopup();
           
           if (TfkLaws.Selected === false) {
             
             TfkLaws.Selected = true;
           
           } else {
             
             TfkLaws.Selected = false;
           }
           
           map.panTo(e.latlng);
           
        });
        
				
				// Highlight country borders 
        TfkLaws.Countries.on('mouseover', function(e) {
          
           $('#info').fadeIn();
          
          var code = e.layer.options.title;
        
          if (TfkLaws.Selected != true) {
          
					if (e.layer._popup._content) {
            $('#info').html(e.layer._popup._content);
          }
    
          if (code) {
            highlightCountry(code);
          }

          e.layer.bringToFront();
          
          }

        });


				// Revert to original style
        TfkLaws.Countries.on('mouseout', function(e) {
        
          if (TfkLaws.Selected != true) {

          TfkLaws.Countries.setStyle({
            color: '#fff'
          });
          
          }

        });


				// Pan and zoom to selected country on search listing click 
        $(document).on('click', '.country-search-link', function(e) {

          e.preventDefault();
          
          $('.search-results').hide();
          
          var code = $(e.target).data('code');
          var lat = '';
          var lng = '';
         
          
          $.each(TfkLaws.Centroids, function(index, value) {
            
            if (value.ISO3136 === code) {
              lat = value.LAT;
              lng = value.LONG;
            }
            
          });


          TfkLaws.Countries.setStyle({
            color: '#fff'
          });


          $.each(TfkLaws.Countries._layers, function(index, value) {

            if (value.feature.properties.iso_a2 === code) {
  
              map.setView([lat, lng], 3);

							if (code) {
								highlightCountry(code);
							}
							
              value.bringToFront();
              
              TfkLaws.Selected = true;

            }

          });

        });
        
        
        // Show next tour item
        $(document).on('click', '.tour-next-btn', function(e) {
        
          e.preventDefault();
          
          var i = parseFloat($('#tour').attr('data-item')) + 1; 
          
          if (i === tour.length) {
            i = 0;
          }
          
          var code = tour[i]['code'];
          
          $('#tour h4').html(tour[i]['title']);
          $('#tour p').html(tour[i]['body']);
          
          map.setView([tour[i]['lat'], tour[i]['lng']], tour[i]['zoom']);
          
          if (code) {
					  highlightCountry(code);
					}
          
          $('#tour').attr('data-item', i);
          
          
        });
        
        
        // Show previous tour item
        $(document).on('click', '.tour-prev-btn', function(e) {
        
          e.preventDefault();
          
          var i = parseFloat($('#tour').attr('data-item')) -1; 
          
          console.log(i);
          
          if (i === -1) {
            i = tour.length -1;
          }
          
          var code = tour[i]['code'];
          
          $('#tour h4').empty().append(tour[i]['title']);
          $('#tour p').empty().append(tour[i]['body']);
          
          map.setView([tour[i]['lat'], tour[i]['lng']], tour[i]['zoom']);
          
          if (code) {
            highlightCountry(code);
          }
          
          $('#tour').attr('data-item', i);
          
        });

		
				// Hide tour on click 
        $(document).on('click', '.tour-close', function(e) {

          e.preventDefault();

          $('#tour').hide();

        });


        // Run search on keyup 
        $('#search').keyup(search);



      });

    }


  });

})();