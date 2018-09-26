import React from 'react';

class SelectedInterests extends React.Component {

  render() {

    return (
      <div className="selectedInterests pts">
        {this.props.selectedInterests.map((interest, index) => {
          return (
            <div
              key={ index }
              className="selectedInterestItem typeEmphasize mvs phm mrs bas"
              style={ { cursor: 'pointer', display: 'inline-block', borderRadius: '25px', borderColor: '#a87c55', color: '#a87c55' } }
              onClick={ () => this.props.onClickSelectedInterestHandler(index) }
            >
              <span
                className="closeButton"
                style={ { lineHeight: '.2em' } }
              />
              x {interest}
            </div>
          );
        })}
      </div>
    );

  }
}

export default SelectedInterests;