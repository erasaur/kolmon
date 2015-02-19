Feature: Player challenges other players

  As a player
  I want to challenge other players
  So that I may enjoy the multiplayer aspect of MMORPGs

  Scenario: User can see a challenge button
    Given I am a user currently in-game
    When I click on another player's icon
    Then I see an option to initiate a challenge

  Scenario: User proposes a challenge
    Given I am a user that can propose challenges
    When I click on the option to initiate a challenge
    Then I see an indicator of a pending challenge

  Scenario: User proposes two challenges
    Given I am a user that has already proposed a challenge
    When I click on the option to initiate a challenge
    Then I see a message indicating a one-challenge limit

  Scenario: User proposes a challenge to occupied user
    Given I am a user that can propose challenges
    When I challenge a user who already accepted a challenge
    Then I see a message indicating the other user is occupied

  Scenario: User accepts a challenge
    Given I am a user that has received a challenge
    When I click on the option to accept the challenge
    Then I am taken to the battle screen

  Scenario: User accepts two challenges
    Given I am a user that has already accepted a challenge
    When I click on the option to accept a challenge
    Then I see a message indicating a one-challenge limit

  Scenario: User accepts challenge from occupied user
    Given I am a user that has received a challenge
    When I click on the option to accept the challenge
    Then I see a message indicating the other user is occupied
