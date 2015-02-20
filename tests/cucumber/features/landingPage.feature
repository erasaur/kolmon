Feature: Attractive Landing Page

  As a visitor
  I want to be greeted with a nice landing page
  So that I am compelled to join the game

  Scenario: Visitors can see a welcome message
    Given I am a new visitor
    When I navigate to the landing page
    Then I see the heading "Welcome"

  Scenario: Visitors can join the game
    Given I am a new visitor
    When I navigate to the landing page
    Then I see a button to sign up

