import { useState, useMemo, useEffect, useCallback } from 'react';
import * as LucideIcons from 'lucide-react';
import * as FaIcons from 'react-icons/fa6';
import * as MdIcons from 'react-icons/md';
import * as FiIcons from 'react-icons/fi';
import * as RiIcons from 'react-icons/ri';
import * as HiIcons from 'react-icons/hi2';
import * as PiIcons from 'react-icons/pi';
import * as TbIcons from 'react-icons/tb';
import * as BiIcons from 'react-icons/bi';
import * as emoji from 'node-emoji';
import { vote, isFirebaseConfigured, getVotes, submitSuggestion } from './firebase';
import type { VoteCounts } from './firebase';


import { emojiToLucideIcon } from '@src/mappings/lucide';
import { emojiToHeroIcon } from '@src/mappings/heroicons';
import { emojiToMaterialIcon } from '@src/mappings/material';
import { emojiToFontAwesome } from '@src/mappings/fontawesome';
import { emojiToFeather } from '@src/mappings/feather';
import { emojiToRemix } from '@src/mappings/remix';
import { emojiToPhosphor } from '@src/mappings/phosphor';
import { emojiToTabler } from '@src/mappings/tabler';
import { emojiToBoxicons } from '@src/mappings/boxicons';
import { emojiToNoto } from '@src/mappings/noto';

import candidatesData from './candidates.json';

// Types
type IconStyle = 'lucide' | 'heroicons' | 'material' | 'fontawesome' | 'feather' | 'remix' | 'phosphor' | 'tabler' | 'boxicons' | 'noto-color' | 'noto-mono';

const MAPPINGS: Record<string, Record<string, string>> = {
  lucide: emojiToLucideIcon,
  heroicons: emojiToHeroIcon,
  material: emojiToMaterialIcon,
  fontawesome: emojiToFontAwesome,
  feather: emojiToFeather,
  remix: emojiToRemix,
  phosphor: emojiToPhosphor,
  tabler: emojiToTabler,
  boxicons: emojiToBoxicons,
  'noto-color': emojiToNoto,
  'noto-mono': emojiToNoto
};

const CANDIDATES = candidatesData as Record<string, Record<string, string[]>>;

// Helpers
const toPascalCase = (str: string) =>
  str.replace(/(^\w|-\w|_\w)/g, (c) => c.replace(/[-_]/, '').toUpperCase());

function getIconComponent(style: IconStyle, name: string) {
  if (!name || name === 'REJECTED') return null;

  try {
    switch (style) {
      case 'lucide': {
        const pascal = toPascalCase(name);
        // @ts-ignore
        return LucideIcons[pascal] || LucideIcons[name];
      }
      case 'heroicons': {
        if (name.startsWith('Hi')) {
          // @ts-ignore
          return HiIcons[name];
        }
        const base = name.replace(/Icon$/, '');
        const key = `Hi${base}`;
        // @ts-ignore
        return HiIcons[key];
      }
      case 'material': {
        // Mappings in file are already 'MdFace' etc. from the expansion script
        // But let's handle cases where it might be raw 'face' too (legacy)
        if (name.startsWith('Md')) {
          // @ts-ignore
          return MdIcons[name];
        }
        const pascal = toPascalCase(name);
        const key = `Md${pascal}`;
        // @ts-ignore
        return MdIcons[key];
      }
      case 'fontawesome': {
        // @ts-ignore
        return FaIcons[name];
      }
      case 'feather': {
        // @ts-ignore
        return FiIcons[name];
      }
      case 'remix': {
        // @ts-ignore
        return RiIcons[name];
      }
      case 'phosphor': {
        const key = name.startsWith('Pi') ? name : `Pi${name}`;
        // @ts-ignore
        return PiIcons[key] || PiIcons[`${key}Bold`] || PiIcons[`${key}Fill`];
      }
      case 'tabler': {
        // Mappings in file are already 'Tb...'
        if (name.startsWith('Tb')) {
          // @ts-ignore
          return TbIcons[name];
        }
        const pascal = toPascalCase(name);
        const key = `Tb${pascal}`;
        // @ts-ignore
        return TbIcons[key];
      }
      case 'boxicons': {
        // Mappings in file are already 'BiSmile' etc.
        if (name.startsWith('Bi')) {
          // @ts-ignore
          return BiIcons[name];
        }
        const pascal = toPascalCase(name);
        const key = `Bi${pascal}`;
        // @ts-ignore
        return BiIcons[key];
      }
      default:
        return null;
    }
  } catch (e) {
    console.error(`Failed to load icon ${name} for ${style}`, e);
    return null;
  }
}

const NotoPreview = ({ type, emoji }: { type: 'color' | 'mono', emoji: string }) => {
  if (type === 'mono') {
    return (
      <span style={{
        fontFamily: '"Noto Emoji"',
        fontSize: '40px',
        lineHeight: '1',
        color: 'white',
        fontWeight: 400
      }}>
        {emoji}
      </span>
    );
  }

  // For Color, use "Noto Color Emoji" font
  return (
    <span style={{
      fontFamily: '"Noto Color Emoji"',
      fontSize: '40px',
      lineHeight: '1',
    }}>
      {emoji}
    </span>
  );
};

const IconPreview = ({ style, name, emojiChar }: { style: IconStyle, name: string, emojiChar: string }) => {
  if (style.startsWith('noto')) {
    const type = style === 'noto-color' ? 'color' : 'mono';
    return <NotoPreview type={type} emoji={emojiChar} />;
  }

  const Icon = getIconComponent(style, name);
  if (!Icon) return <span style={{ fontSize: '10px', color: '#666', marginTop: '5px' }}>No Preview</span>;
  return <Icon size={40} />;
};

import { getEmojiCategory } from './categoryHelper';

function App() {
  const [activeStyle, setActiveStyle] = useState<IconStyle>('lucide');
  const [filterText, setFilterText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [modifications, setModifications] = useState<Record<string, Record<string, string>>>(() => {
    const saved = localStorage.getItem('emoji-validator-mods');
    return saved ? JSON.parse(saved) : {};
  });
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [reportView, setReportView] = useState<'list' | 'json'>('list');
  const [showReport, setShowReport] = useState(false);
  type MonoMode = 'off' | 'light' | 'dark';
  const [monoMode, setMonoMode] = useState<MonoMode>('off');

  // Voting state
  const [voteCounts, setVoteCounts] = useState<Record<string, VoteCounts>>({});
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>(() => {
    const saved = localStorage.getItem('emoji-validator-votes');
    return saved ? JSON.parse(saved) : {};
  });
  const [votingInProgress, setVotingInProgress] = useState<Record<string, boolean>>({});
  const firebaseReady = isFirebaseConfigured();

  // Create a vote key for tracking
  const createVoteKey = useCallback((emojiChar: string, library: string) => {
    return `${library}_${emojiChar}`;
  }, []);

  // Fetch vote counts for visible items
  useEffect(() => {
    if (!firebaseReady) return;

    const currentMapping = MAPPINGS[activeStyle] || {};
    const emojis = Object.keys(currentMapping).slice(0, 50); // Limit to first 50 for perf

    emojis.forEach(async (emojiChar) => {
      const key = createVoteKey(emojiChar, activeStyle);
      if (voteCounts[key]) return; // Already fetched

      const counts = await getVotes(emojiChar, activeStyle);
      if (counts) {
        setVoteCounts(prev => ({ ...prev, [key]: counts }));
      }
    });
  }, [activeStyle, firebaseReady, createVoteKey, voteCounts]);

  // Handle voting
  const handleVote = async (emojiChar: string, iconName: string, type: 'up' | 'down') => {
    if (!firebaseReady) return;

    const voteKey = createVoteKey(emojiChar, activeStyle);

    // Check if user already voted on this mapping
    if (userVotes[voteKey]) return;

    setVotingInProgress(prev => ({ ...prev, [voteKey]: true }));

    const success = await vote(emojiChar, iconName, activeStyle, type);

    if (success) {
      // Update local vote counts
      setVoteCounts(prev => {
        const current = prev[voteKey] || { upvotes: 0, downvotes: 0 };
        return {
          ...prev,
          [voteKey]: {
            upvotes: current.upvotes + (type === 'up' ? 1 : 0),
            downvotes: current.downvotes + (type === 'down' ? 1 : 0),
          },
        };
      });

      // Track user's vote
      const newUserVotes = { ...userVotes, [voteKey]: type };
      setUserVotes(newUserVotes);
      localStorage.setItem('emoji-validator-votes', JSON.stringify(newUserVotes));
    }

    setVotingInProgress(prev => ({ ...prev, [voteKey]: false }));
  };

  const cycleMonoMode = () => {
    if (monoMode === 'off') setMonoMode('light');
    else if (monoMode === 'light') setMonoMode('dark');
    else setMonoMode('off');
  };

  const confirmClearModifications = () => {
    setModifications({});
    localStorage.removeItem('emoji-validator-mods');
    setShowResetConfirm(false);
  };

  const getMonoFilter = () => {
    switch (monoMode) {
      case 'light': return 'grayscale(100%) brightness(0) invert(100%)';
      case 'dark': return 'grayscale(100%) brightness(0)';
      default: return 'none';
    }
  };

  const getMonoColor = () => {
    switch (monoMode) {
      case 'light': return 'white';
      case 'dark': return 'black';
      default: return undefined; // Inherit
    }
  };




  const selectCandidate = (emoji: string, iconName: string) => {
    // Record suggestion to Firebase (fire and forget)
    if (firebaseReady) {
      submitSuggestion(emoji, activeStyle, iconName);
    }

    setModifications(prev => {
      const styleMods = prev[activeStyle] || {};
      const newMods = { ...styleMods, [emoji]: iconName };
      if (iconName === MAPPINGS[activeStyle as string][emoji]) {
        delete newMods[emoji];
      }
      const newState = { ...prev, [activeStyle]: newMods };
      localStorage.setItem('emoji-validator-mods', JSON.stringify(newState));
      return newState;
    });
  };

  const cycleCandidate = (emoji: string, direction: 'next' | 'prev') => {
    // Not supported for Noto yet (no candidates list for hex codes usually)
    if (activeStyle.startsWith('noto')) return;

    const current = modifications[activeStyle]?.[emoji] || MAPPINGS[activeStyle as string][emoji];
    const candidates = CANDIDATES[activeStyle]?.[emoji] || [];
    const list = candidates.includes(current) ? candidates : [current, ...candidates];
    const idx = list.indexOf(current);
    let newIdx = direction === 'next' ? (idx + 1) : (idx - 1 + list.length);
    newIdx %= list.length;
    if (list[newIdx]) selectCandidate(emoji, list[newIdx]);
  };

  const currentMapping = MAPPINGS[activeStyle as string] || {};
  let items = Object.entries(currentMapping);

  // Filter items
  items = items.filter(([emojiChar, iconName]) => {
    const emojiName = emoji.find(emojiChar)?.key || '';
    const matchesText = !filterText || (
      emojiChar.includes(filterText) ||
      iconName.toLowerCase().includes(filterText.toLowerCase()) ||
      emojiName.includes(filterText.toLowerCase())
    );

    const isRejected = modifications[activeStyle]?.[emojiChar] === 'REJECTED';
    const isModified = !!modifications[activeStyle]?.[emojiChar] && !isRejected;

    const category = getEmojiCategory(emojiChar, emojiName);
    let matchesCategory = false;
    if (categoryFilter === 'All') matchesCategory = true;
    else if (categoryFilter === 'Rejected') matchesCategory = isRejected;
    else if (categoryFilter === 'Reassigned') matchesCategory = isModified;
    else matchesCategory = category.includes(categoryFilter) || (categoryFilter === 'Other' && category === 'Other');

    return matchesText && matchesCategory;
  });

  // Calculate generic Categories for dropdown
  const categories = ['All', 'Rejected', 'Reassigned', 'Action', 'Alert', 'Audio & Video', 'Communication', 'Content', 'Device', 'Editor', 'File', 'Hardware', 'Home', 'Image', 'Maps', 'Navigation', 'Notification', 'Places', 'Search', 'Social', 'Toggle', 'Other'];

  const reportData = useMemo(() => JSON.stringify(modifications, null, 2), [modifications]);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-sans p-8 selection:bg-accent-blue-idle selection:text-white">
      <div className="max-w-[1600px] mx-auto">
        <div className="border-b border-metal-trim pb-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-wider text-white mb-2 uppercase">Emoji Mapping Validator</h1>
              <p className="text-text-muted text-sm max-w-2xl font-mono">
                 // SYSTEM: Use directional controls to cycle alternates. <br />
                 // AMBER indicators signal modified local overrides.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 items-center bg-frame p-2 rounded-md border border-metal-trim">
              <div className="relative group">
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="appearance-none bg-bg-secondary border border-metal-trim text-text-primary px-4 py-2 pr-8 rounded-sm text-sm focus:border-accent-blue-active focus:outline-none focus:ring-1 focus:ring-accent-blue-active/50 transition-all hover:bg-bg-secondary/80 w-48 font-mono"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">▼</div>
              </div>

              <button
                onClick={cycleMonoMode}
                className={`px-4 py-2 rounded-sm text-sm font-medium border transition-all uppercase tracking-wide
                    ${monoMode !== 'off'
                    ? 'bg-accent-blue-idle border-accent-blue-active text-white shadow-[0_0_10px_rgba(48,85,117,0.3)]'
                    : 'bg-bg-secondary border-metal-trim text-text-muted hover:text-white hover:border-metal-highlight'
                  }`}
              >
                {`MONO: ${monoMode.toUpperCase()}`}
              </button>

              <div className="relative">
                <input
                  type="text"
                  placeholder="SEARCH_DB..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="bg-bg-secondary border border-metal-trim text-text-primary pl-4 pr-10 py-2 rounded-sm text-sm focus:border-accent-blue-active focus:outline-none focus:ring-1 focus:ring-accent-blue-active/50 w-64 placeholder-metal-base font-mono"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-metal-base">🔍</div>
              </div>

              <button
                className="px-4 py-2 bg-accent-blue-idle/20 border border-accent-blue-idle text-accent-blue-active hover:bg-accent-blue-idle/40 hover:text-white rounded-sm text-sm font-medium uppercase tracking-wider transition-all"
                onClick={() => setShowReport(true)}
              >
                Report <span className="ml-1 font-mono text-xs opacity-70">[{Object.values(modifications).reduce((acc, m) => acc + Object.keys(m).length, 0)}]</span>
              </button>

              {Object.keys(modifications).length > 0 && (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="px-4 py-2 bg-accent-red-idle/20 border border-accent-red-idle text-accent-red-active hover:bg-accent-red-idle/40 hover:text-white rounded-sm text-sm font-medium uppercase tracking-wider transition-all"
                >
                  RESET
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 border-b border-metal-trim pb-1">
          {Object.keys(MAPPINGS).map(style => {
            const isActive = activeStyle === style;
            const label = style === 'noto-color' ? 'Noto Color' : style === 'noto-mono' ? 'Noto Mono' : style;
            return (
              <button
                key={style}
                className={`px-5 py-2 text-sm font-medium uppercase tracking-wider rounded-t-sm transition-all border-t border-x mb-[-1px]
                  ${isActive
                    ? 'bg-bg-primary border-metal-trim border-b-bg-primary text-accent-blue-active relative z-10'
                    : 'bg-bg-secondary/50 border-transparent text-text-muted hover:text-text-primary hover:bg-bg-secondary'
                  }`}
                onClick={() => setActiveStyle(style as IconStyle)}
              >
                {label}
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
          {items.map(([emojiChar, defaultIcon]) => {
            const modification = modifications[activeStyle]?.[emojiChar];
            const isRejected = modification === 'REJECTED';
            const isModified = !!modification;
            const currentIconName = modification || defaultIcon;

            // If rejected, render default icon but styled differently.
            // If normal modification, render modification.
            const iconToRender = isRejected ? defaultIcon : currentIconName;

            const candidates = CANDIDATES[activeStyle]?.[emojiChar] || [];
            const hasCandidates = candidates.length > 0;
            const emojiName = emoji.find(emojiChar)?.key || 'unknown';

            // Voting data
            const voteKey = createVoteKey(emojiChar, activeStyle);
            const counts = voteCounts[voteKey] || { upvotes: 0, downvotes: 0 };
            const userVote = userVotes[voteKey];
            const isVoting = votingInProgress[voteKey];

            return (
              <div
                key={emojiChar}
                className={`relative group bg-frame border rounded-md p-4 flex flex-col items-center gap-4 transition-all duration-200
                  ${isRejected
                    ? 'bg-accent-red-idle/5 border-accent-red-active/50 shadow-[0_0_15px_rgba(255,59,48,0.1)]'
                    : isModified
                      ? 'border-accent-amber-idle/50 shadow-[0_0_15px_rgba(231,156,53,0.1)]'
                      : 'border-metal-trim hover:border-metal-highlight hover:shadow-lg hover:shadow-black/50'
                  }`}
              >
                {/* Status Indicator Line */}
                <div className={`absolute top-0 left-0 w-full h-[2px] rounded-t-md 
                    ${isRejected ? 'bg-accent-red-active' : isModified ? 'bg-accent-amber-active' : 'bg-transparent group-hover:bg-metal-highlight/50'}`}
                />

                <div className="w-full flex justify-between items-start text-xs font-mono text-text-muted">
                  <span className="truncate max-w-[120px]" title={emojiName}>{emojiName}</span>
                </div>

                <div className="text-4xl filter drop-shadow-lg transition-transform group-hover:scale-110 duration-200">
                  {emojiChar}
                </div>

                <div className={`px-2 py-1 rounded-sm text-xs font-mono border max-w-full truncate text-center transition-colors
                   ${isRejected
                    ? 'bg-accent-red-idle/10 border-accent-red-active text-accent-red-active'
                    : isModified
                      ? 'bg-accent-amber-idle/10 border-accent-amber-idle text-accent-amber-active'
                      : 'bg-bg-primary border-metal-trim text-text-muted group-hover:text-text-primary group-hover:border-metal-highlight'
                  }`}
                  title={isRejected ? 'REJECTED' : currentIconName}
                >
                  {isRejected ? 'REJECTED' : currentIconName}
                </div>

                <div className={`h-12 w-12 flex items-center justify-center transition-all ${isRejected ? 'opacity-50 grayscale contrast-125' : 'text-accent-blue-active'}`}
                  style={{
                    filter: getMonoFilter(),
                    color: getMonoColor()
                  }}>
                  <IconPreview style={activeStyle} name={iconToRender} emojiChar={emojiChar} />
                </div>

                {/* Voting buttons */}
                {firebaseReady && (
                  <div className="flex items-center gap-2 w-full justify-center border-t border-metal-trim/50 pt-3 mt-1">
                    <button
                      onClick={() => handleVote(emojiChar, currentIconName, 'up')}
                      disabled={!!userVote || isVoting}
                      className={`flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-mono border transition-all
                        ${userVote === 'up'
                          ? 'bg-green-500/20 border-green-500 text-green-400'
                          : userVote
                            ? 'opacity-40 cursor-not-allowed bg-bg-secondary border-metal-trim text-text-muted'
                            : 'bg-bg-secondary border-metal-trim text-text-muted hover:text-green-400 hover:border-green-500 hover:bg-green-500/10'
                        }`}
                      title={userVote ? "You already voted" : "Good match"}
                    >
                      <span>👍</span>
                      <span>{counts.upvotes}</span>
                    </button>
                    <button
                      onClick={() => handleVote(emojiChar, currentIconName, 'down')}
                      disabled={!!userVote || isVoting}
                      className={`flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-mono border transition-all
                        ${userVote === 'down'
                          ? 'bg-red-500/20 border-red-500 text-red-400'
                          : userVote
                            ? 'opacity-40 cursor-not-allowed bg-bg-secondary border-metal-trim text-text-muted'
                            : 'bg-bg-secondary border-metal-trim text-text-muted hover:text-red-400 hover:border-red-500 hover:bg-red-500/10'
                        }`}
                      title={userVote ? "You already voted" : "Bad match"}
                    >
                      <span>👎</span>
                      <span>{counts.downvotes}</span>
                    </button>
                  </div>
                )}

                <div className="flex gap-1 mt-auto pt-2 opacity-40 group-hover:opacity-100 transition-opacity w-full justify-center">
                  {hasCandidates && !activeStyle.startsWith('noto') && (
                    <button
                      onClick={() => cycleCandidate(emojiChar, 'prev')}
                      className="h-8 w-8 flex items-center justify-center rounded-sm bg-bg-secondary border border-metal-trim text-text-muted hover:text-white hover:border-accent-blue-active hover:bg-accent-blue-idle/20 transition-all font-mono text-lg leading-none"
                      title="Previous Candidate"
                    >
                      ‹
                    </button>
                  )}

                  {!activeStyle.startsWith('noto') && (
                    <button
                      onClick={() => selectCandidate(emojiChar, isRejected ? defaultIcon : 'REJECTED')}
                      className={`h-8 w-8 flex items-center justify-center rounded-sm border transition-all font-mono text-sm leading-none
                           ${isRejected
                          ? 'bg-accent-red-idle border-accent-red-active text-white'
                          : 'bg-bg-secondary border-metal-trim text-text-muted hover:text-white hover:border-accent-red-active hover:bg-accent-red-idle/20'
                        }`}
                      title={isRejected ? "Un-reject / Restore Default" : "Reject / No Match"}
                    >
                      ✕
                    </button>
                  )}

                  {hasCandidates && !activeStyle.startsWith('noto') && (
                    <button
                      onClick={() => cycleCandidate(emojiChar, 'next')}
                      className="h-8 w-8 flex items-center justify-center rounded-sm bg-bg-secondary border border-metal-trim text-text-muted hover:text-white hover:border-accent-blue-active hover:bg-accent-blue-idle/20 transition-all font-mono text-lg leading-none"
                      title="Next Candidate"
                    >
                      ›
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8 z-50">
          <div className="bg-[#14171C] border border-accent-red-active/50 rounded-lg w-full max-w-md shadow-[0_0_30px_rgba(255,59,48,0.2)] relative animated-modal">
            <div className="p-6 border-b border-[#464B4E] bg-[#1E2328] flex items-center text-accent-red-active gap-3">
              <span className="text-2xl">⚠</span>
              <h2 className="text-xl font-semibold tracking-wide font-sans uppercase">Confirm Reset</h2>
            </div>
            <div className="p-6 bg-[#0A0C0E] text-[#C1C5C8]">
              <p className="mb-4">Are you sure you want to clear all modifications? This action cannot be undone.</p>
              <div className="text-xs font-mono text-[#6F7477]">
                Total Modifications: <span className="text-accent-red-active">{Object.values(modifications).reduce((acc, m) => acc + Object.keys(m).length, 0)}</span>
              </div>
            </div>
            <div className="p-4 border-t border-[#464B4E] bg-[#1E2328] flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-6 py-2 bg-transparent border border-[#464B4E] text-[#6F7477] hover:text-white hover:border-[#C1C5C8] rounded-sm text-sm font-medium uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearModifications}
                className="px-6 py-2 bg-accent-red-idle border border-accent-red-active text-white rounded-sm text-sm font-medium uppercase tracking-wider hover:bg-accent-red-active hover:shadow-[0_0_15px_rgba(255,59,48,0.4)] transition-all"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {showReport && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8 z-50">
          <div className="bg-[#14171C] border border-[#464B4E] rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl relative">
            <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-b border-[#464B4E] bg-[#1E2328] gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold tracking-wide text-[#C1C5C8] font-sans uppercase">Modification Report</h2>
                <div className="flex bg-[#0A0C0E] p-1 rounded-sm border border-[#464B4E]">
                  <button
                    onClick={() => setReportView('list')}
                    className={`px-3 py-1 text-xs font-mono uppercase transition-all rounded-sm ${reportView === 'list' ? 'bg-[#305575] text-white' : 'text-[#6F7477] hover:text-[#C1C5C8]'}`}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setReportView('json')}
                    className={`px-3 py-1 text-xs font-mono uppercase transition-all rounded-sm ${reportView === 'json' ? 'bg-[#305575] text-white' : 'text-[#6F7477] hover:text-[#C1C5C8]'}`}
                  >
                    JSON
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowReport(false)}
                className="text-[#6F7477] hover:text-white transition-colors text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-0 flex-1 overflow-hidden relative min-h-[400px] flex flex-col bg-[#0A0C0E]">
              {reportView === 'json' ? (
                <pre className="w-full h-full p-6 overflow-auto text-xs font-mono text-[#3FFF59] selection:bg-[#1C8E32] selection:text-white whitespace-pre-wrap">
                  {reportData}
                </pre>
              ) : (
                <div className="w-full h-full overflow-auto">
                  {Object.keys(modifications).length === 0 ? (
                    <div className="flex items-center justify-center h-full text-[#6F7477] font-mono uppercase">
                      No modifications yet.
                    </div>
                  ) : (
                    <table className="w-full text-left text-sm font-mono border-collapse">
                      <thead className="bg-[#1E2328] text-[#C1C5C8] sticky top-0 border-b border-[#464B4E]">
                        <tr>
                          <th className="p-4 font-normal uppercase tracking-wider">Style</th>
                          <th className="p-4 font-normal uppercase tracking-wider">Emoji</th>
                          <th className="p-4 font-normal uppercase tracking-wider">Assigned Icon</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1E2328]">
                        {Object.entries(modifications).flatMap(([style, mods]) =>
                          Object.entries(mods).map(([char, icon]) => (
                            <tr key={`${style}-${char}`} className="hover:bg-[#14171C] text-[#C1C5C8]">
                              <td className="p-4 text-[#6F7477]">{style}</td>
                              <td className="p-4 text-2xl">{char}</td>
                              <td className={`p-4 ${icon === 'REJECTED' ? 'text-[#FF4444]' : 'text-[#3FFF59]'}`}>
                                {icon}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-[#464B4E] bg-[#1E2328] flex justify-end gap-3 flex-wrap">
              <button
                onClick={() => {
                  const blob = new Blob([reportData], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'emoji_modifications.json';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="px-6 py-2 bg-[#1C8E32] border border-[#3FFF59] text-white rounded-sm text-sm font-medium uppercase tracking-wider hover:bg-[#3FFF59] hover:text-black transition-all"
              >
                Download JSON
              </button>
              <button
                onClick={() => {
                  window.open('https://github.com/huikku/emoji-to-icons/issues/new?title=Emoji%20Validator%20Report&body=Please%20paste%20the%20report%20content%20here.', '_blank');
                }}
                className="px-6 py-2 bg-bg-secondary border border-metal-trim text-text-primary rounded-sm text-sm font-medium uppercase tracking-wider hover:bg-frame hover:text-white transition-all"
              >
                Open GitHub Issue
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(reportData)}
                className="px-6 py-2 bg-[#305575] border border-[#68A9EC] text-white rounded-sm text-sm font-medium uppercase tracking-wider hover:bg-[#68A9EC] transition-all"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => setShowReport(false)}
                className="px-6 py-2 bg-transparent border border-[#464B4E] text-[#6F7477] hover:text-white hover:border-[#C1C5C8] rounded-sm text-sm font-medium uppercase tracking-wider transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
