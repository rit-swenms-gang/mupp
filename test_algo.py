import unittest
from unittest.mock import patch, MagicMock
from main import DungeonMaster
from main import Player

class TestDNDMatching(unittest.TestCase):    
    def setUp(self):
        # Sample DM and Player objects for testing
        self.dm = DungeonMaster("TestDM", "Storytelling", "Experienced", "Intermediate", "Mystery;Horror", "Strict", "Strategic", "plot")
        self.player = Player("TestPlayer", 1, "Storytelling", "Experienced", "Intermediate", "Mystery;Action", "Strict", "Strategic", "plot", 3)
    
    def test_dm_initialization(self):
        self.assertEqual(self.dm.name, "TestDM")
        self.assertEqual(self.dm.xp, "Experienced")
        self.assertEqual(self.dm.campaignStyles, ["Mystery", "Horror"])
    
    def test_player_initialization(self):
        self.assertEqual(self.player.name, "TestPlayer")
        self.assertEqual(self.player.xp, "Experienced")
        self.assertEqual(self.player.campaignStyles, ["Mystery", "Action"])
    
    def test_match_player(self):
        # Expected match score based on shared attributes
        score = self.dm.matchPlayer(self.player)
        self.assertGreaterEqual(score, 1)  # Should match at least on one attribute
    
    def test_schedule_player(self):
        self.dm.schedulePlayer(0, self.player.name)
        self.assertIn(self.player.name, self.dm.schedule[0])
        self.assertEqual(self.dm.slotsOpen, 14)
    
    def test_schedule_game(self):
        self.player.scheduleGame(0, self.dm.name)
        self.assertEqual(self.player.schedule[0], self.dm.name)
        self.assertEqual(self.player.gamesScheduled, 1)
        
        
if __name__ == "__main__":
    unittest.main()