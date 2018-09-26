import React from 'react';

class RequestComplete extends React.Component {

  render() {

    return (
      <div id="requestCompleteContainer" className="row mvl txtC">

        <div className="miniCol24 xxsColOffset4 xxsCol16 phl">
          <h2 className="ptl typeEmphasize">
            Your request for a Coffee Buddy has been received.
          </h2>
          <p className="typeLowlight">
            We'll notify you once we find you a coffee buddy!
          </p>
        </div>

        <div className="miniCol24 xxsCol24 pvl phl">
          <button
            className="pam btn btnSecondary findButton typeEmphasize"
            onClick={ () => this.props.onBackToProfileClick() }
          >
            Back to Profile
          </button>
        </div>

      </div>
    );

  }
}


export default RequestComplete;