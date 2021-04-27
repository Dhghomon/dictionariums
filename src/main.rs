use std::io;

use crossterm::event::{read, Event, KeyCode, KeyModifiers};
use tui::backend::CrosstermBackend;
use tui::layout::{Constraint, Direction, Layout};
use tui::style::{Color, Modifier, Style};
use tui::text::{Span, Spans};
use tui::widgets::{Block, BorderType, Borders, Paragraph, Tabs, Wrap};
use tui::Terminal;
use rayon::prelude::*;

#[derive(Clone)]
struct Dictionaries<'a> {
    english: &'a str,
    german: &'a str,
    czech: &'a str,
    esperanto: &'a str,
    cosmoglotta: &'a str,
    cosmoglotta2: &'a str,
    current_string: String,
    current_language: Language,
}

#[derive(Clone, Copy, Debug, PartialEq)]
enum Language {
    English,
    German,
    Czech,
    Esperanto,
    Cosmoglotta,
    Cosmoglotta2
}

impl Dictionaries<'_> {
    fn search(&mut self) -> Vec<Spans> {
        use Language::*;
        let dictionary = match self.current_language {
            English => self.english,
            German => self.german,
            Czech => self.czech,
            Esperanto => self.esperanto,
            Cosmoglotta => self.cosmoglotta,
            Cosmoglotta2 => self.cosmoglotta2
        };
        
        let mut return_vec: Vec<Spans> = vec![];

        let search_term = match &self.current_string {
            content if content.contains('[') && content.contains(']') => {
                // let mut new_string = content.split_at(content.rfind('[').unwrap()).1.to_string();
                // new_string.retain(|character| character != '[' && character != ']');
                // new_string
                let start = content.rfind('[').unwrap();
                let finish = content.rfind(']').unwrap();
                let mut new_string = content[start..finish].to_string();
                new_string.retain(|character| character != '[' && character!= ']');
                new_string
            }
            _ => {
                if self.current_string.contains(' ') {
                    let index = self.current_string.rfind(' ').unwrap_or(0);
                    self.current_string[index + 1..].to_lowercase()
                } else {
                    self.current_string.to_lowercase()
                }
            }
        };

        if self.current_string.contains('[') && self.current_string.contains(']') {
            self.current_string
                .retain(|character| character != '[' && character != ']');
        }

        let style = Style::default()
            .fg(Color::Yellow)
            .add_modifier(Modifier::ITALIC);
        
        let x = dictionary
            .par_lines()
            .filter(|line| line.to_lowercase().contains(&search_term) && search_term.len()> 1)
            .map(|line| line.to_lowercase())
            .collect::<Vec<String>>();



        for search_result in x.into_iter().take(20) {

                let split_line = search_result
                    .splitn(2, &search_term)
                    .map(|word| word.to_string())
                    .collect::<Vec<String>>();

                let four_items = Spans::from(vec![
                    Span::raw(split_line.get(0).cloned().unwrap_or("".to_string())),
                    Span::styled(search_term.clone(), style),
                    Span::raw(split_line.get(1).cloned().unwrap_or("".to_string())),
                    Span::raw("\n".to_string()),
                ]);

                return_vec.push(four_items);

        }

        // Leave this here in case we need to go to single threads if WASM works


        // let mut words = 0;
        // for line in dictionary.lines() {
        //     if line.to_lowercase().contains(&search_term) {
        //         let split_line = line
        //             .to_lowercase()
        //             .splitn(2, &search_term)
        //             .map(|word| word.to_lowercase())
        //             .collect::<Vec<String>>();

        //         let four_items = Spans::from(vec![
        //             Span::raw(split_line.get(0).cloned().unwrap_or("".to_string())),
        //             Span::styled(search_term.clone(), style),
        //             Span::raw(split_line.get(1).cloned().unwrap_or("".to_string())),
        //             Span::raw("\n".to_string()),
        //         ]);

        //         return_vec.push(four_items);
        //         words += 1;
        //     }
        //     if words > 19 {
        //         break;
        //     }
        // }
        return_vec
    }

    fn switch(&mut self) {
        use Language::*;
        match self.current_language {
            English => self.current_language = German,
            German => self.current_language = Czech,
            Czech => self.current_language = Esperanto,
            Esperanto => self.current_language = Cosmoglotta,
            Cosmoglotta => self.current_language = Cosmoglotta2,
            Cosmoglotta2 => self.current_language = English
        }
    }
}



fn main() -> Result<(), io::Error> {
    let mut dictionaries = Dictionaries {
        english: include_str!("dictionarium.txt"),
        german: include_str!("dictionarium-de.txt"),
        czech: include_str!("tchek.txt"),
        esperanto: include_str!("esperanto.txt"),
        cosmoglotta: include_str!("cosmoglotta.txt"),
        cosmoglotta2: include_str!("cosmoglotta2.txt"),
        current_string: String::new(),
        current_language: Language::English,
    };

    let stdout = io::stdout();
    let backend = CrosstermBackend::new(stdout);
    let mut terminal = Terminal::new(backend)?;

    terminal.clear()?;
    terminal.draw(|f| {
        let intro = Layout::default()
        .margin(1)

        .constraints([Constraint::Percentage(100)])
        .split(f.size());

        let basic_info = Paragraph::new("Benevenit al dictionarium in Occidental.
\nPles presser sur quelcunc clave por comensar.
\nActualmen tu posse serchar in dictionariums in:\n·anglés\n·german\n·tchek\n·esperanto\n·li archives de Cosmoglotta inter 1922 e 1950.
\nOn usa Tab por changear inter lingues.
\nPor serchar con plu quam un parol, on usa [].
Por exemple: [un bon idé].
Sin capter it inter in [], 'un bon idé' vell serchar por solmen li parol 'idé'."

        )
        .wrap(Wrap{trim: true})
        .block(Block::default().title("Benevenit!").borders(Borders::ALL)
        .border_type(BorderType::Double));

        f.render_widget(basic_info, intro[0]);

    })?;

    let mut first_time = true;

    loop {
        match read() {
            Ok(Event::Key(keycode)) => match (keycode.code, keycode.modifiers) {
                (KeyCode::Char('x'), KeyModifiers::CONTROL) => break,
                (KeyCode::Char('s'), KeyModifiers::CONTROL) => terminal.clear()?,
                (KeyCode::Char('n'), KeyModifiers::CONTROL) => {
                    let stringy = dictionaries.current_string.clone();
                    terminal.draw(|f| {
                        let area = Layout::default()
                            .constraints([
                                Constraint::Percentage(20),
                                Constraint::Percentage(60),
                                Constraint::Percentage(20),
                            ])
                            .split(f.size());

                        f.render_widget(Paragraph::new(stringy).wrap(Wrap { trim: true }), area[1]);
                    })?;
                    read().unwrap();
                }
                (KeyCode::Char(char), _) => {
                    dictionaries.current_string.push(char);
                }
                (KeyCode::Backspace, _) => {
                    dictionaries.current_string.pop();
                }
                (KeyCode::Esc, _) => {
                    dictionaries.current_string.clear();
                }
                (KeyCode::Tab, _) => {
                    dictionaries.switch();
                }
                _ => {}
            },
            _ => {}
        }
        if first_time {
            dictionaries.current_string.clear();
            first_time = false;
        }

        let v = Layout::default() // v for vertical
            .direction(Direction::Vertical)
            .margin(1)
            .constraints(
                [
                    Constraint::Min(3),
                    Constraint::Percentage(30),
                    Constraint::Percentage(70),
                ]
                .as_ref(),
            )
            .split(terminal.size().unwrap());
        let [language_rect, typing_rect, results_rect] = [v[0], v[1], v[2]];

        terminal.draw(|f| {
            // let horizontal = Layout::default()
            //     .direction(Direction::Horizontal)
            //     .margin(1)
            //     .constraints([Constraint::Percentage(50), Constraint::Percentage(50)].as_ref())
            //     .split(results_rect);

            let results_block = Paragraph::new(dictionaries.search())
                .block(Block::default().title("Resultates").borders(Borders::ALL));

            f.render_widget(results_block, results_rect);

            let languages = [
                "Anglés",
                "German",
                "Tchek",
                "Esperanto",
                "Cosmoglotta 1",
                "Cosmoglotta 2"
            ]
            .iter()
            .cloned()
            .map(Spans::from)
            .collect();

            f.render_widget(
                Tabs::new(languages)
                    .block(Block::default().title("Lingues").borders(Borders::ALL))
                    .highlight_style(Style::default().fg(Color::Yellow))
                    .select(dictionaries.current_language as usize),
                language_rect,
            );

            let typing_block = Paragraph::new(dictionaries.current_string.clone())
                .wrap(Wrap { trim: true })
                .block(Block::default().title("Tippar ci").borders(Borders::ALL));

            f.render_widget(typing_block, typing_rect);
        })?;
    }
    Ok(())
}
